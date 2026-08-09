import math
import json
import threading
import time
import urllib.parse
import urllib.request
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
        state.pending_friends = {}
        state.direct_rooms = {}
        state.groups = {}
        state.nearby_messages = {}
        state.recommendation_cache = {}
        server.app.jochwon_realtime = state
    if not hasattr(state, "pending_friends"):
        state.pending_friends = {}
    if not hasattr(state, "recommendation_cache"):
        state.recommendation_cache = {}
    return server.app.jochwon_realtime


def _public_participant(player):
    return {
        "id": player["id"],
        "nickname": player["nickname"],
        "appearance": player["appearance"],
        "matchProfile": player.get("matchProfile"),
    }


def _public_player(player):
    result = dict(player)
    result.pop("roomId", None)
    return result


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

    def _room_key(self, map_id, sid):
        if map_id != "personal-farm":
            return map_id
        user_id = self._authenticated(sid)
        return "personal-farm:" + (str(user_id) if user_id else "guest:" + sid)

    def _players_in(self, room_id):
        with self.state.lock:
            return [
                _public_player(player)
                for player in self.state.players.values()
                if player.get("roomId", player.get("mapId")) == room_id
            ]

    def _publish(self, io, room_id):
        io.emit("onlineUsersUpdated", self._players_in(room_id), to=room_id)

    def _authenticated(self, sid):
        with self.state.lock:
            return self.state.auth_users.get(sid)

    def _emit_defaults(self, io, sid, room_id):
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
            history = list(self.state.nearby_messages.get(room_id, []))
        io.emit("nearbyChatHistory", history, to=sid)

    def _chat_tables(self, wiz):
        struct = wiz.model("struct")
        rooms = struct.db("realtime_direct_room")
        friendships = struct.db("realtime_friendship")
        messages = struct.db("realtime_direct_message")
        rooms.orm.create_table(safe=True)
        friendships.orm.create_table(safe=True)
        messages.orm.create_table(safe=True)
        return rooms, friendships, messages

    def _persist_room(self, wiz, room, member_user_ids):
        now = _now_ms()
        member_a, member_b = sorted(str(item) for item in member_user_ids)
        rooms, _, _ = self._chat_tables(wiz)
        values = {"member_a": member_a, "member_b": member_b, "active": True, "accepted_at": now, "updated_at": now}
        if rooms.get(id=room["id"]) is None:
            rooms.insert({"id": room["id"], "created_at": now, **values})
        else:
            rooms.update(values, id=room["id"])

    def _existing_room_id(self, wiz, member_user_ids):
        member_a, member_b = sorted(str(item) for item in member_user_ids)
        rooms, _, _ = self._chat_tables(wiz)
        rows = [row for row in rooms.rows(orderby="updated_at", order="DESC", dump=1000) if {str(row.get("member_a")), str(row.get("member_b"))} == {member_a, member_b}]
        return rows[0]["id"] if rows else None

    def _existing_active_room_id(self, wiz, member_user_ids):
        member_a, member_b = sorted(str(item) for item in member_user_ids)
        rooms, _, _ = self._chat_tables(wiz)
        rows = [row for row in rooms.rows(orderby="updated_at", order="DESC", dump=1000) if row.get("active") and {str(row.get("member_a")), str(row.get("member_b"))} == {member_a, member_b}]
        return rows[0]["id"] if rows else None

    def _close_rooms_for_pair(self, wiz, io, member_user_ids, by_id):
        member_a, member_b = sorted(str(item) for item in member_user_ids)
        rooms, _, _ = self._chat_tables(wiz)
        rows = [row for row in rooms.rows(dump=1000) if row.get("active") and {str(row.get("member_a")), str(row.get("member_b"))} == {member_a, member_b}]
        for row in rows:
            rooms.update({"active": False, "updated_at": _now_ms()}, id=row["id"])
        room_ids = {str(row["id"]) for row in rows}
        with self.state.lock:
            for room_id, entry in self.state.direct_rooms.items():
                if set(str(item) for item in entry["memberUserIds"]) == {member_a, member_b}:
                    entry["room"]["active"] = False
                    room_ids.add(room_id)
        for room_id in room_ids:
            io.emit(
                "directChatClosed",
                {"directRoomId": room_id, "byId": by_id},
                to=room_id,
            )

    def _friend_user_ids(self, wiz, user_id):
        _, friendships, _ = self._chat_tables(wiz)
        user_id = str(user_id)
        return {str(row["user_b"] if str(row.get("user_a")) == user_id else row["user_a"]) for row in friendships.rows(dump=2000) if user_id in (str(row.get("user_a")), str(row.get("user_b")))}

    def _emit_friend_state(self, wiz, io, sid):
        user_id = self._authenticated(sid)
        if not user_id:
            io.emit("friendState", {"friendIds": []}, to=sid)
            return
        friend_users = self._friend_user_ids(wiz, user_id)
        with self.state.lock:
            friend_ids = [
                socket_id for socket_id, target_user in self.state.auth_users.items()
                if target_user in friend_users and socket_id in self.state.players
            ]
        io.emit("friendState", {"friendIds": friend_ids}, to=sid)

    def _publish_friend_states(self, wiz, io):
        with self.state.lock:
            socket_ids = list(self.state.players)
        for socket_id in socket_ids:
            self._emit_friend_state(wiz, io, socket_id)

    def _save_friendship(self, wiz, first_user_id, second_user_id):
        user_a, user_b = sorted((str(first_user_id), str(second_user_id)))
        _, friendships, _ = self._chat_tables(wiz)
        record_id = user_a + ":" + user_b
        values = {"user_a": user_a, "user_b": user_b, "accepted_at": _now_ms()}
        if friendships.get(id=record_id) is None:
            friendships.insert({"id": record_id, **values})
        else:
            friendships.update(values, id=record_id)

    def _remove_friendship(self, wiz, first_user_id, second_user_id):
        user_a, user_b = sorted((str(first_user_id), str(second_user_id)))
        _, friendships, _ = self._chat_tables(wiz)
        friendships.delete(id=user_a + ":" + user_b)

    def _persist_message(self, wiz, message_id, room_id, user_id, message):
        _, _, messages = self._chat_tables(wiz)
        messages.insert({"id": message_id, "room_id": room_id, "sender_user_id": str(user_id), "message": message, "sent_at": _now_ms()})

    def _emit_direct_history(self, wiz, io, room_id, participants, user_socket_ids, to_id):
        _, _, messages = self._chat_tables(wiz)
        names = {str(user_id): self.state.players.get(socket_id, {}).get("nickname", "사용자") for user_id, socket_id in user_socket_ids.items()}
        rows = [row for row in messages.rows(orderby="sent_at", order="ASC", dump=300) if str(row.get("room_id")) == room_id][-200:]
        for row in rows:
            sender_user_id = str(row.get("sender_user_id"))
            io.emit("directMessageReceived", {"id": str(row.get("id")), "directRoomId": room_id, "senderId": user_socket_ids.get(sender_user_id, sender_user_id), "nickname": names.get(sender_user_id, "사용자"), "message": str(row.get("message") or ""), "createdAt": int(row.get("sent_at") or 0), "type": "user"}, to=to_id)

    def _close_persisted_room(self, wiz, room_id):
        rooms, _, _ = self._chat_tables(wiz)
        if rooms.get(id=room_id) is not None:
            rooms.update({"active": False, "updated_at": _now_ms()}, id=room_id)

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
            previous_room = previous.get("roomId", previous["mapId"])
            io.leave(previous_room)
            io.emit("userLeft", sid, to=previous_room, skip_sid=sid)
            self._publish(io, previous_room)

        profile = data.get("matchProfile")
        if not isinstance(profile, dict):
            profile = previous.get("matchProfile") if previous else None
        room_id = self._room_key(map_id, sid)
        player = {
            "id": sid,
            "mapId": map_id,
            "roomId": room_id,
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
        io.join(room_id)
        self._emit_defaults(io, sid, room_id)
        users = self._players_in(room_id)
        io.emit("currentMapUsers", users, to=sid)
        io.emit("userJoined", _public_player(player), to=room_id, skip_sid=sid)
        self._publish(io, room_id)
        self._publish_friend_states(wiz, io)

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
            room_id = player.get("roomId", player["mapId"])
        self._publish(io, room_id)

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
            moved = _public_player(player)
            room_id = player.get("roomId", player["mapId"])
        io.emit("userMoved", moved, to=room_id, skip_sid=sid)

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
        if not source or not target or source.get("roomId", source["mapId"]) != target.get("roomId", target["mapId"]):
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
            to=player.get("roomId", player["mapId"]),
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
            room_id = player.get("roomId", player["mapId"])
            history = self.state.nearby_messages.setdefault(room_id, [])
            history.append(payload)
            del history[:-50]
        io.emit("nearbyChat", payload, to=room_id)

    def directChatRequest(self, wiz, data, flask, io):
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
        if (
            target_user in self._friend_user_ids(wiz, source_user)
            and self._existing_active_room_id(wiz, [source_user, target_user])
        ):
            self.directChatResume(wiz, to_id, flask, io)
            return
        with self.state.lock:
            duplicate = next((
                request for request in self.state.pending_direct.values()
                if {request["fromUserId"], request["toUserId"]} == {source_user, target_user}
            ), None)
        if duplicate:
            io.emit("errorMessage", "이미 1대1 대화 요청을 보냈어요.", to=sid)
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

    def directChatResume(self, wiz, data, flask, io):
        sid = self._sid(flask)
        to_id = _text(data, 80)
        with self.state.lock:
            source = self.state.players.get(sid)
            target = self.state.players.get(to_id)
            source_user = self.state.auth_users.get(sid)
            target_user = self.state.auth_users.get(to_id)
        if not source or not target or not source_user or not target_user:
            io.emit("directChatResumeRequired", {"toId": to_id}, to=sid)
            return
        if target_user not in self._friend_user_ids(wiz, source_user):
            io.emit("directChatResumeRequired", {"toId": to_id}, to=sid)
            return
        member_user_ids = [source_user, target_user]
        room_id = self._existing_active_room_id(wiz, member_user_ids)
        if not room_id:
            io.emit("directChatResumeRequired", {"toId": to_id}, to=sid)
            return
        room = {
            "id": room_id,
            "participants": [_public_participant(source), _public_participant(target)],
            "active": True,
            "acceptedAt": _now_ms(),
        }
        with self.state.lock:
            self.state.direct_rooms[room_id] = {
                "room": room,
                "memberSocketIds": [sid, to_id],
                "memberUserIds": member_user_ids,
            }
        io.join(room_id, sid=sid)
        io.join(room_id, sid=to_id)
        io.emit("directChatStarted", room, to=sid)
        io.emit("directChatAvailable", room, to=to_id)
        self._emit_direct_history(wiz, io, room_id, room["participants"], {str(source_user): sid, str(target_user): to_id}, sid)

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
        member_user_ids = [request["fromUserId"], request["toUserId"]]
        room_id = self._existing_room_id(wiz, member_user_ids) or "direct-" + str(uuid.uuid4())
        room = {
            "id": room_id,
            "participants": [_public_participant(source), _public_participant(target)],
            "active": True,
            "acceptedAt": _now_ms(),
        }
        try:
            self._persist_room(
                wiz,
                room,
                member_user_ids,
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
                "memberUserIds": member_user_ids,
            }
        io.join(room["id"], sid=request["fromId"])
        io.join(room["id"], sid=request["toId"])
        io.emit("directChatStarted", room, to=request["fromId"])
        io.emit("directChatStarted", room, to=request["toId"])
        socket_ids = {str(request["fromUserId"]): request["fromId"], str(request["toUserId"]): request["toId"]}
        self._emit_direct_history(wiz, io, room["id"], room["participants"], socket_ids, request["fromId"])
        self._emit_direct_history(wiz, io, room["id"], room["participants"], socket_ids, request["toId"])

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

    def friendRequest(self, wiz, data, flask, io):
        sid = self._sid(flask)
        to_id = _text(data, 80)
        with self.state.lock:
            source = self.state.players.get(sid)
            target = self.state.players.get(to_id)
            source_user = self.state.auth_users.get(sid)
            target_user = self.state.auth_users.get(to_id)
        if not source or not target or sid == to_id:
            io.emit("errorMessage", "접속 중인 사용자에게만 친구 요청을 보낼 수 있어요.", to=sid)
            return
        if not source_user or not target_user:
            io.emit("errorMessage", "친구 요청은 로그인한 사용자끼리 이용할 수 있어요.", to=sid)
            return
        if target_user in self._friend_user_ids(wiz, source_user):
            io.emit("errorMessage", "이미 친구인 사용자예요.", to=sid)
            return
        with self.state.lock:
            duplicate = next((
                request for request in self.state.pending_friends.values()
                if {request["fromUserId"], request["toUserId"]} == {source_user, target_user}
            ), None)
        if duplicate:
            io.emit("errorMessage", "이미 친구 요청을 보냈어요.", to=sid)
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
            self.state.pending_friends[request_id] = {
                "fromId": sid,
                "toId": to_id,
                "fromUserId": source_user,
                "toUserId": target_user,
            }
        io.emit("friendRequestReceived", request, to=to_id)

    def friendAccept(self, wiz, data, flask, io):
        sid = self._sid(flask)
        request_id = _text(data, 80)
        with self.state.lock:
            request = self.state.pending_friends.get(request_id)
            if not request or request["toId"] != sid:
                return
        try:
            self._save_friendship(wiz, request["fromUserId"], request["toUserId"])
        except Exception:
            io.emit("errorMessage", "친구 관계를 저장하지 못했습니다.", to=sid)
            return
        with self.state.lock:
            self.state.pending_friends.pop(request_id, None)
        payload = {"requestId": request_id, "status": "accepted"}
        io.emit("friendRequestResolved", payload, to=request["fromId"])
        io.emit("friendRequestResolved", payload, to=request["toId"])
        self._publish_friend_states(wiz, io)

    def friendReject(self, data, flask, io):
        sid = self._sid(flask)
        request_id = _text(data, 80)
        with self.state.lock:
            request = self.state.pending_friends.get(request_id)
            if not request or request["toId"] != sid:
                return
            self.state.pending_friends.pop(request_id, None)
        io.emit(
            "friendRequestResolved",
            {"requestId": request_id, "status": "rejected"},
            to=request["fromId"],
        )

    def friendRemove(self, wiz, data, flask, io):
        sid = self._sid(flask)
        to_id = _text(data, 80)
        with self.state.lock:
            source_user = self.state.auth_users.get(sid)
            target_user = self.state.auth_users.get(to_id)
        if not source_user or not target_user:
            return
        self._close_rooms_for_pair(
            wiz, io, [source_user, target_user], sid
        )
        self._remove_friendship(wiz, source_user, target_user)
        self._publish_friend_states(wiz, io)

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

    def directRecommendationRequest(self, wiz, data, flask, io):
        if not isinstance(data, dict):
            return
        started = time.perf_counter()
        sid = self._sid(flask)
        room_id = _text(data.get("directRoomId"), 80)
        user_request = _text(data.get("userRequest"), 200)
        user_id = self._authenticated(sid)
        with self.state.lock:
            entry = self.state.direct_rooms.get(room_id)
        if not entry or sid not in entry["memberSocketIds"] or user_id not in entry["memberUserIds"]:
            io.emit("directRecommendationFailed", {"directRoomId": room_id, "message": "이 채팅방의 참여자만 추천을 요청할 수 있습니다."}, to=sid)
            return
        io.emit("directRecommendationStarted", {"directRoomId": room_id, "stage": "analyzing"}, to=room_id)
        _, _, messages_db = self._chat_tables(wiz)
        load_started = time.perf_counter()
        rows = [row for row in messages_db.rows(orderby="sent_at", order="DESC", dump=200) if str(row.get("room_id")) == room_id][:20]
        rows.reverse()
        load_ms = round((time.perf_counter() - load_started) * 1000)
        if len(rows) < 2:
            io.emit("directRecommendationFailed", {"directRoomId": room_id, "message": "대화를 2개 이상 나눈 뒤 추천해 주세요."}, to=sid)
            return
        combined = " ".join([str(row.get("message") or "") for row in rows] + [user_request])
        categories = [
            ("카페", ("카페", "커피", "디저트")), ("음식점", ("밥", "먹", "맛집", "고기", "식당")),
            ("공원", ("산책", "걷", "공원")), ("전시", ("전시", "미술", "박물관")),
            ("영화관", ("영화", "시네마")), ("체험", ("체험", "놀", "데이트")),
        ]
        analysis_started = time.perf_counter()
        category = next((label for label, words in categories if any(word in combined for word in words)), "관광명소")
        query = user_request or ("세종 " + category)
        analysis_ms = round((time.perf_counter() - analysis_started) * 1000)
        fingerprint = str(rows[-1].get("id")) + ":" + query
        cached = self.state.recommendation_cache.get(room_id)
        if cached and cached.get("fingerprint") == fingerprint and cached.get("expires", 0) > _now_ms():
            io.emit("directRecommendationCompleted", {"directRoomId": room_id, "message": cached["message"]}, to=room_id)
            return
        io.emit("directRecommendationStarted", {"directRoomId": room_id, "stage": "searching"}, to=room_id)
        search_started = time.perf_counter()
        try:
            config = wiz.config("secret")
            key = str(getattr(config, "KAKAO_REST_API_KEY", "") or "").strip()
            params = urllib.parse.urlencode({"query": query, "x": "127.289", "y": "36.5", "radius": "20000", "size": "10"})
            request = urllib.request.Request("https://dapi.kakao.com/v2/local/search/keyword.json?" + params, headers={"Authorization": "KakaoAK " + key})
            with urllib.request.urlopen(request, timeout=8) as response:
                documents = json.loads(response.read().decode("utf-8")).get("documents", [])
        except Exception:
            io.emit("directRecommendationFailed", {"directRoomId": room_id, "message": "카카오 장소 검색이 지연되고 있어요. 잠시 후 다시 시도해 주세요."}, to=sid)
            return
        search_ms = round((time.perf_counter() - search_started) * 1000)
        places = []
        for item in documents:
            address = str(item.get("address_name") or "")
            road = str(item.get("road_address_name") or "")
            if "세종특별자치시" not in address and "세종특별자치시" not in road:
                continue
            places.append({"id": str(item.get("id") or ""), "name": str(item.get("place_name") or ""), "category": str(item.get("category_name") or ""), "address": address, "roadAddress": road, "phone": str(item.get("phone") or ""), "externalUrl": str(item.get("place_url") or ""), "longitude": float(item.get("x")), "latitude": float(item.get("y")), "distanceMeters": int(item.get("distance") or 0), "source": "kakao", "recommendationReason": "최근 대화에서 함께 하고 싶은 활동과 맞는 실제 세종 장소예요."})
            if len(places) >= 3:
                break
        if not places:
            io.emit("directRecommendationFailed", {"directRoomId": room_id, "message": "조건에 맞는 실제 세종 장소를 찾지 못했어요. 다른 활동으로 다시 요청해 주세요."}, to=sid)
            return
        recommendation_id = "recommendation-" + str(uuid.uuid4())
        message = {"id": str(uuid.uuid4()), "directRoomId": room_id, "senderId": "chungnyeongi", "nickname": "충녕이", "message": "최근 대화와 잘 맞는 실제 세종 장소를 찾았어요.", "createdAt": _now_ms(), "type": "ai-recommendation", "recommendation": {"recommendationId": recommendation_id, "summary": "대화에서 확인된 활동을 기준으로 카카오 장소 검색 결과를 골랐어요.", "basis": {"activity": category, "region": "세종특별자치시", "rejectedCategories": [], "mood": []}, "places": places}}
        self.state.recommendation_cache[room_id] = {"fingerprint": fingerprint, "expires": _now_ms() + 300000, "message": message}
        io.emit("directRecommendationCompleted", {"directRoomId": room_id, "message": message}, to=room_id)
        total_ms = round((time.perf_counter() - started) * 1000)
        print("[direct-place-performance] conversation_load={}ms analysis={}ms kakao_search={}ms selection=0ms total={}ms".format(load_ms, analysis_ms, search_ms, total_ms))

    def directChatClosed(self, wiz, data, flask, io):
        sid = self._sid(flask)
        room_id = _text(data, 80)
        with self.state.lock:
            entry = self.state.direct_rooms.get(room_id)
            if not entry or sid not in entry["memberSocketIds"]:
                return
            entry["room"]["active"] = False
        try:
            self._close_persisted_room(wiz, room_id)
        except Exception:
            pass
        io.emit(
            "directChatClosed",
            {"directRoomId": room_id, "byId": sid},
            to=room_id,
        )

    def directChatFocusEnded(self, data, flask, io):
        """End the live conversation posture for both members without deleting the room."""
        sid = self._sid(flask)
        room_id = _text(data, 80)
        with self.state.lock:
            entry = self.state.direct_rooms.get(room_id)
            if (
                not entry
                or not entry["room"].get("active")
                or sid not in entry["memberSocketIds"]
            ):
                return
        io.emit(
            "directChatFocusEnded",
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
            "roomId": owner.get("roomId", owner["mapId"]),
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
            if not group or not player or player.get("roomId", player["mapId"]) != group.get("roomId", group["mapId"]):
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
            for request_id, request in list(self.state.pending_friends.items()):
                if sid in (request["fromId"], request["toId"]):
                    self.state.pending_friends.pop(request_id, None)
        if not player:
            return
        room_id = player.get("roomId", player["mapId"])
        io.emit("userLeft", sid, to=room_id, skip_sid=sid)
        self._publish(io, room_id)
