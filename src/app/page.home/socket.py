import datetime
import math
import threading
import time
import uuid

import season


VALID_MAPS = {
    "personal-farm", "town", "arts-center", "festival-experience",
    "food-experience", "club-street-festival", "bear-tree-park",
    "bear-play-zone", "garden", "campus", "student-hall",
    "recruitment-center", "project-room", "government",
    "government-central-plaza", "government-policy-hall",
    "government-observatory", "sejong-smart-city", "jochwon-station",
    "traditional-market", "jochwon-park", "college-street",
}
VALID_DIRECTIONS = {"up", "down", "left", "right"}
VALID_MOTIONS = {"idle", "walk", "run"}
VALID_EMOTES = {"hi", "clapping", "talking", None}
FIXED_RESPAWN = {"x": 1105, "z": 711, "yaw": 0}


def _now_ms():
    return int(time.time() * 1000)


def _text(value, limit):
    return str(value or "").strip()[:limit]


def _number(value, fallback=0):
    try:
        parsed = float(value)
        return parsed if math.isfinite(parsed) else fallback
    except (TypeError, ValueError):
        return fallback


def _state(server):
    state = getattr(server.app, "jochwon_realtime", None)
    if state is None:
        state = season.util.stdClass()
        state.lock = threading.RLock()
        state.players = {}
        state.auth_users = {}
        state.pending_direct = {}
        state.direct_rooms = {}
        state.groups = {}
        state.nearby_messages = {}
        server.app.jochwon_realtime = state
    return server.app.jochwon_realtime


def _public_participant(player):
    return {
        "id": player["id"],
        "nickname": player["nickname"],
        "appearance": player["appearance"],
        "matchProfile": player.get("matchProfile"),
    }


class Controller:
    def __init__(self, server):
        self.server = server
        self.state = _state(server)

    def _sid(self, flask):
        return flask.request.sid

    def _user_id(self, wiz):
        try:
            return wiz.model("portal/season/session").use().get("id")
        except Exception:
            return None

    def _players_in(self, map_id):
        with self.state.lock:
            return [
                dict(player)
                for player in self.state.players.values()
                if player.get("mapId") == map_id
            ]

    def _publish(self, io, map_id):
        io.emit("onlineUsersUpdated", self._players_in(map_id), to=map_id)

    def _authenticated(self, sid):
        with self.state.lock:
            return self.state.auth_users.get(sid)

    def _emit_defaults(self, io, sid, map_id):
        io.emit("worldClock", _now_ms(), to=sid)
        io.emit("portalEditorPermission", False, to=sid)
        io.emit("portalPositionsUpdated", [], to=sid)
        io.emit(
            "bearTreePortalPositionsUpdated",
            {"town": {"x": 1185, "z": 1616}, "photo": {"x": 1482, "z": 661}},
            to=sid,
        )
        io.emit("interactionPositionsUpdated", [], to=sid)
        io.emit("lakeExperiencePositionsUpdated", [], to=sid)
        io.emit("campusFeaturePortalPositionsUpdated", [], to=sid)
        io.emit("lakeWishesUpdated", [], to=sid)
        with self.state.lock:
            history = list(self.state.nearby_messages.get(map_id, []))
        io.emit("nearbyChatHistory", history, to=sid)

    def _persist_room(self, wiz, room, member_user_ids):
        struct = wiz.model("struct")
        db = struct.db("realtime_direct_room")
        db.orm.create_table(safe=True)
        now = datetime.datetime.now()
        db.insert({
            "id": room["id"],
            "member_a": str(member_user_ids[0]),
            "member_b": str(member_user_ids[1]),
            "active": True,
            "accepted_at": now,
            "created": now,
            "updated": now,
        })

    def _persist_message(self, wiz, message_id, room_id, user_id, message):
        struct = wiz.model("struct")
        db = struct.db("realtime_direct_message")
        db.orm.create_table(safe=True)
        now = datetime.datetime.now()
        db.insert({
            "id": message_id,
            "room_id": room_id,
            "sender_user_id": str(user_id),
            "message": message,
            "sent_at": now,
            "created": now,
        })

    def connect(self, wiz, flask):
        sid = self._sid(flask)
        user_id = self._user_id(wiz)
        with self.state.lock:
            self.state.auth_users[sid] = str(user_id) if user_id else None

    def joinMap(self, wiz, data, flask, io):
        if not isinstance(data, dict):
            return
        map_id = _text(data.get("mapId"), 64)
        if map_id not in VALID_MAPS:
            return
        sid = self._sid(flask)
        with self.state.lock:
            previous = self.state.players.get(sid)
        if previous:
            previous_map = previous["mapId"]
            io.leave(previous_map)
            io.emit("userLeft", sid, to=previous_map, skip_sid=sid)
            self._publish(io, previous_map)

        profile = data.get("matchProfile")
        if not isinstance(profile, dict):
            profile = previous.get("matchProfile") if previous else None
        player = {
            "id": sid,
            "mapId": map_id,
            "x": _number(data.get("x")),
            "y": _number(data.get("y")),
            "direction": "down",
            "isMoving": False,
            "yaw": 0,
            "motionState": "idle",
            "jumpHeight": 0,
            "timestamp": _now_ms(),
            "nickname": _text(data.get("nickname"), 16) or "조치원 주민",
            "appearance": data.get("appearance") if isinstance(data.get("appearance"), dict) else {},
            "model": _text(data.get("model"), 24) or "custom",
            "matchProfile": profile,
        }
        with self.state.lock:
            self.state.players[sid] = player
        io.join(map_id)
        self._emit_defaults(io, sid, map_id)
        users = self._players_in(map_id)
        io.emit("currentMapUsers", users, to=sid)
        io.emit("userJoined", dict(player), to=map_id, skip_sid=sid)
        self._publish(io, map_id)

    def changeMap(self, wiz, data, flask, io):
        self.joinMap(wiz, data, flask, io)

    def updateMatchProfile(self, data, flask, io):
        if not isinstance(data, dict):
            return
        sid = self._sid(flask)
        with self.state.lock:
            player = self.state.players.get(sid)
            if not player:
                return
            player["matchProfile"] = data
            map_id = player["mapId"]
        self._publish(io, map_id)

    def userMoved(self, data, flask, io):
        if not isinstance(data, dict):
            return
        sid = self._sid(flask)
        with self.state.lock:
            player = self.state.players.get(sid)
            if not player or player["mapId"] != data.get("mapId"):
                return
            player.update({
                "x": _number(data.get("x"), player["x"]),
                "y": _number(data.get("y"), player["y"]),
                "direction": data.get("direction") if data.get("direction") in VALID_DIRECTIONS else player["direction"],
                "isMoving": bool(data.get("isMoving")),
                "yaw": _number(data.get("yaw"), player["yaw"]),
                "motionState": data.get("motionState") if data.get("motionState") in VALID_MOTIONS else "idle",
                "jumpHeight": max(0, min(140, _number(data.get("jumpHeight"), 0))),
                "timestamp": int(_number(data.get("timestamp"), _now_ms())),
            })
            moved = dict(player)
            map_id = player["mapId"]
        io.emit("userMoved", moved, to=map_id, skip_sid=sid)

    def enterProjectRoomInstance(self, data, flask, io):
        sid = self._sid(flask)
        project_room_id = _text(data, 80)
        with self.state.lock:
            player = self.state.players.get(sid)
            if not player or player["mapId"] != "project-room" or not project_room_id:
                return
            player["projectRoomId"] = project_room_id
            users = [
                dict(item)
                for item in self.state.players.values()
                if item.get("mapId") == "project-room"
                and item.get("projectRoomId") == project_room_id
            ]
        io.emit("currentMapUsers", users, to=sid)

    def encounterFocus(self, data, flask, io):
        if not isinstance(data, dict):
            return
        sid = self._sid(flask)
        to_id = _text(data.get("toId"), 80)
        with self.state.lock:
            source = self.state.players.get(sid)
            target = self.state.players.get(to_id)
        if not source or not target or source["mapId"] != target["mapId"]:
            return
        if math.hypot(source["x"] - target["x"], source["y"] - target["y"]) > 300:
            return
        payload = {"withId": to_id, "active": bool(data.get("active"))}
        io.emit("encounterFocusChanged", payload, to=sid)
        io.emit(
            "encounterFocusChanged",
            {"withId": sid, "active": payload["active"]},
            to=to_id,
        )

    def characterEmote(self, data, flask, io):
        emote = data if data in VALID_EMOTES else None
        sid = self._sid(flask)
        with self.state.lock:
            player = self.state.players.get(sid)
        if not player:
            return
        io.emit(
            "characterEmoteChanged",
            {"playerId": sid, "emote": emote},
            to=player["mapId"],
        )

    def sendNearbyChat(self, data, flask, io):
        sid = self._sid(flask)
        message = _text(data, 180)
        with self.state.lock:
            player = self.state.players.get(sid)
            if not player or not message:
                return
            payload = {
                "id": str(uuid.uuid4()),
                "mapId": player["mapId"],
                "senderId": sid,
                "nickname": player["nickname"],
                "message": message,
                "createdAt": _now_ms(),
                "channel": "nearby",
            }
            history = self.state.nearby_messages.setdefault(player["mapId"], [])
            history.append(payload)
            del history[:-50]
            map_id = player["mapId"]
        io.emit("nearbyChat", payload, to=map_id)

    def directChatRequest(self, data, flask, io):
        sid = self._sid(flask)
        to_id = _text(data, 80)
        with self.state.lock:
            source = self.state.players.get(sid)
            target = self.state.players.get(to_id)
            source_user = self.state.auth_users.get(sid)
            target_user = self.state.auth_users.get(to_id)
        if not source or not target:
            io.emit("errorMessage", "접속 중인 사용자에게만 요청할 수 있어요.", to=sid)
            return
        if not source_user or not target_user:
            io.emit("errorMessage", "1대1 채팅은 로그인한 사용자끼리 이용할 수 있어요.", to=sid)
            return
        request_id = str(uuid.uuid4())
        request = {
            "requestId": request_id,
            "from": {
                "id": source["id"],
                "nickname": source["nickname"],
                "appearance": source["appearance"],
            },
            "toId": to_id,
        }
        with self.state.lock:
            self.state.pending_direct[request_id] = {
                "fromId": sid,
                "toId": to_id,
                "fromUserId": source_user,
                "toUserId": target_user,
            }
        io.emit("directChatRequested", request, to=to_id)

    def directChatAccept(self, wiz, data, flask, io):
        sid = self._sid(flask)
        request_id = _text(data, 80)
        with self.state.lock:
            request = self.state.pending_direct.get(request_id)
            if not request or request["toId"] != sid:
                return
            source = self.state.players.get(request["fromId"])
            target = self.state.players.get(request["toId"])
        if not source or not target:
            return
        room = {
            "id": "direct-" + str(uuid.uuid4()),
            "participants": [_public_participant(source), _public_participant(target)],
            "active": True,
            "acceptedAt": _now_ms(),
        }
        try:
            self._persist_room(
                wiz,
                room,
                [request["fromUserId"], request["toUserId"]],
            )
        except Exception:
            io.emit("errorMessage", "1대1 채팅방을 저장하지 못했습니다.", to=sid)
            io.emit("errorMessage", "1대1 채팅방을 저장하지 못했습니다.", to=request["fromId"])
            return
        with self.state.lock:
            self.state.pending_direct.pop(request_id, None)
            self.state.direct_rooms[room["id"]] = {
                "room": room,
                "memberSocketIds": [request["fromId"], request["toId"]],
                "memberUserIds": [request["fromUserId"], request["toUserId"]],
            }
        io.join(room["id"], sid=request["fromId"])
        io.join(room["id"], sid=request["toId"])
        io.emit("directChatStarted", room, to=request["fromId"])
        io.emit("directChatStarted", room, to=request["toId"])

    def directChatReject(self, data, flask, io):
        sid = self._sid(flask)
        request_id = _text(data, 80)
        with self.state.lock:
            request = self.state.pending_direct.get(request_id)
            if not request or request["toId"] != sid:
                return
            self.state.pending_direct.pop(request_id, None)
        io.emit(
            "directChatRejected",
            {"requestId": request_id, "byId": sid},
            to=request["fromId"],
        )

    def directMessage(self, wiz, data, flask, io):
        if not isinstance(data, dict):
            return
        sid = self._sid(flask)
        room_id = _text(data.get("directRoomId"), 80)
        message = _text(data.get("message"), 500)
        user_id = self._authenticated(sid)
        with self.state.lock:
            entry = self.state.direct_rooms.get(room_id)
            player = self.state.players.get(sid)
        if (
            not entry
            or not entry["room"].get("active")
            or sid not in entry["memberSocketIds"]
            or user_id not in entry["memberUserIds"]
            or not player
            or not message
        ):
            return
        message_id = str(uuid.uuid4())
        try:
            self._persist_message(wiz, message_id, room_id, user_id, message)
        except Exception:
            io.emit("errorMessage", "메시지를 저장하지 못했습니다.", to=sid)
            return
        payload = {
            "id": message_id,
            "directRoomId": room_id,
            "senderId": sid,
            "nickname": player["nickname"],
            "message": message,
            "createdAt": _now_ms(),
            "type": "user",
        }
        io.emit("directMessageReceived", payload, to=room_id)

    def directChatClosed(self, wiz, data, flask, io):
        sid = self._sid(flask)
        room_id = _text(data, 80)
        with self.state.lock:
            entry = self.state.direct_rooms.get(room_id)
            if not entry or sid not in entry["memberSocketIds"]:
                return
            entry["room"]["active"] = False
        try:
            db = wiz.model("portal/season/orm").use("realtime_direct_room")
            db.update(
                {"active": False, "updated": datetime.datetime.now()},
                id=room_id,
            )
        except Exception:
            pass
        io.emit(
            "directChatClosed",
            {"directRoomId": room_id, "byId": sid},
            to=room_id,
        )

    def createGroup(self, data, flask, io):
        if not isinstance(data, dict):
            return
        sid = self._sid(flask)
        with self.state.lock:
            owner = self.state.players.get(sid)
        if not owner:
            return
        member_ids = [sid]
        for item in data.get("inviteeIds") or []:
            item = _text(item, 80)
            if item and item in self.state.players and item not in member_ids:
                member_ids.append(item)
        group = {
            "id": "group-" + str(uuid.uuid4()),
            "name": _text(data.get("name"), 30) or "동네 모임",
            "ownerId": sid,
            "memberIds": member_ids,
            "mapId": owner["mapId"],
        }
        with self.state.lock:
            self.state.groups[group["id"]] = group
        for member_id in member_ids:
            io.join(group["id"], sid=member_id)
            io.emit("groupCreated", group, to=member_id)

    def joinGroup(self, data, flask, io):
        sid = self._sid(flask)
        group_id = _text(data, 80)
        with self.state.lock:
            group = self.state.groups.get(group_id)
            player = self.state.players.get(sid)
            if not group or not player or player["mapId"] != group["mapId"]:
                return
            if sid not in group["memberIds"]:
                group["memberIds"].append(sid)
        io.join(group_id)
        io.emit("groupUpdated", group, to=group_id)

    def sendGroupChat(self, data, flask, io):
        if not isinstance(data, dict):
            return
        sid = self._sid(flask)
        group_id = _text(data.get("groupId"), 80)
        message = _text(data.get("message"), 180)
        with self.state.lock:
            group = self.state.groups.get(group_id)
            player = self.state.players.get(sid)
        if not group or sid not in group["memberIds"] or not player or not message:
            return
        io.emit(
            "nearbyChat",
            {
                "id": str(uuid.uuid4()),
                "mapId": player["mapId"],
                "senderId": sid,
                "nickname": player["nickname"],
                "message": message,
                "createdAt": _now_ms(),
                "channel": "group",
            },
            to=group_id,
        )

    def disconnect(self, flask, io):
        sid = self._sid(flask)
        with self.state.lock:
            player = self.state.players.pop(sid, None)
            self.state.auth_users.pop(sid, None)
            for request_id, request in list(self.state.pending_direct.items()):
                if sid in (request["fromId"], request["toId"]):
                    self.state.pending_direct.pop(request_id, None)
        if not player:
            return
        io.emit("userLeft", sid, to=player["mapId"], skip_sid=sid)
        self._publish(io, player["mapId"])
