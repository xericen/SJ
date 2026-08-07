import importlib.util
import tempfile
from pathlib import Path
from types import SimpleNamespace


PROJECT_ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location(
    "jochwon_socket", PROJECT_ROOT / "src/app/page.home/socket.py"
)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class FakeSession:
    def __init__(self, user_id):
        self.user_id = user_id

    def use(self):
        return self

    def get(self, key):
        return self.user_id if key == "id" else None


class FakeWiz:
    def __init__(self, user_id, project_path):
        self.user_id = user_id
        self.project = SimpleNamespace(
            fs=lambda: SimpleNamespace(abspath=lambda: project_path)
        )

    def model(self, _path):
        return FakeSession(self.user_id)


class FakeIo:
    def __init__(self):
        self.current_sid = None
        self.rooms = {}
        self.events = []

    def emit(self, event, payload, to=None, skip_sid=None):
        self.events.append((event, payload, to, skip_sid))

    def join(self, room, sid=None):
        self.rooms.setdefault(room, set()).add(sid or self.current_sid)

    def leave(self, room):
        self.rooms.setdefault(room, set()).discard(self.current_sid)

    def latest(self, event, target):
        return next(
            payload
            for name, payload, to, _skip in reversed(self.events)
            if name == event and to == target
        )


def flask_for(sid):
    return SimpleNamespace(request=SimpleNamespace(sid=sid))


def payload(map_id, nickname):
    return {
        "mapId": map_id,
        "nickname": nickname,
        "x": 1050,
        "y": 1510,
        "model": "custom",
        "appearance": {},
    }


with tempfile.TemporaryDirectory(prefix="wiz-socket-source-") as runtime:
    server = SimpleNamespace(app=SimpleNamespace())
    controller = module.Controller(server)
    io = FakeIo()
    first_wiz, second_wiz = FakeWiz("user-a", runtime), FakeWiz("user-b", runtime)
    first_flask, second_flask = flask_for("socket-a"), flask_for("socket-b")

    controller.connect(first_wiz, first_flask)
    controller.connect(second_wiz, second_flask)
    io.current_sid = "socket-a"
    controller.joinMap(first_wiz, payload("personal-farm", "A"), first_flask, io)
    io.current_sid = "socket-b"
    controller.joinMap(second_wiz, payload("personal-farm", "B"), second_flask, io)
    assert [item["id"] for item in io.latest("currentMapUsers", "socket-a")] == ["socket-a"]
    assert [item["id"] for item in io.latest("currentMapUsers", "socket-b")] == ["socket-b"]

    io.current_sid = "socket-a"
    controller.changeMap(first_wiz, payload("town", "A"), first_flask, io)
    io.current_sid = "socket-b"
    controller.changeMap(second_wiz, payload("town", "B"), second_flask, io)

    io.current_sid = "socket-a"
    controller.friendRequest(first_wiz, "socket-b", first_flask, io)
    friend_request = io.latest("friendRequestReceived", "socket-b")
    io.current_sid = "socket-b"
    controller.friendAccept(second_wiz, friend_request["requestId"], second_flask, io)
    assert "socket-b" in io.latest("friendState", "socket-a")["friendIds"]
    assert "socket-a" in io.latest("friendState", "socket-b")["friendIds"]

    io.current_sid = "socket-a"
    controller.directChatRequest(first_wiz, "socket-b", first_flask, io)
    direct_request = io.latest("directChatRequested", "socket-b")
    io.current_sid = "socket-b"
    controller.directChatAccept(second_wiz, direct_request["requestId"], second_flask, io)
    first_room_id = io.latest("directChatStarted", "socket-a")["id"]
    request_count = sum(1 for event in io.events if event[0] == "directChatRequested")
    io.current_sid = "socket-a"
    controller.directChatRequest(first_wiz, "socket-b", first_flask, io)
    assert io.latest("directChatStarted", "socket-a")["id"] == first_room_id
    assert sum(1 for event in io.events if event[0] == "directChatRequested") == request_count

    controller.directChatFocusEnded(first_room_id, first_flask, io)
    assert io.latest("directChatFocusEnded", first_room_id) == {
        "directRoomId": first_room_id,
        "byId": "socket-a",
    }
    assert controller.state.direct_rooms[first_room_id]["room"]["active"] is True

    io.current_sid = "socket-b"
    controller.directChatClosed(second_wiz, first_room_id, second_flask, io)

    io.current_sid = "socket-a"
    controller.directChatRequest(first_wiz, "socket-b", first_flask, io)
    next_request = io.latest("directChatRequested", "socket-b")
    io.current_sid = "socket-b"
    controller.directChatAccept(second_wiz, next_request["requestId"], second_flask, io)
    assert io.latest("directChatStarted", "socket-a")["id"] == first_room_id

    io.current_sid = "socket-a"
    controller.friendRemove(first_wiz, "socket-b", first_flask, io)
    assert io.latest("directChatClosed", first_room_id)["directRoomId"] == first_room_id
    request_count = sum(1 for event in io.events if event[0] == "directChatRequested")
    controller.directChatRequest(first_wiz, "socket-b", first_flask, io)
    assert sum(1 for event in io.events if event[0] == "directChatRequested") == request_count + 1

print("WIZ socket source verification passed: mutual friend accept, shared chat focus end, room resume, leave/re-request")
