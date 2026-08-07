import math
import os
import sqlite3
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
        state.pending_friends = {}
        state.direct_rooms = {}
        state.groups = {}
        state.nearby_messages = {}
        server.app.jochwon_realtime = state
    if not hasattr(state, "pending_friends"):
        state.pending_friends = {}
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

    def _chat_database(self, wiz):
        runtime_dir = os.path.join(wiz.project.fs().abspath(), "runtime")
        os.makedirs(runtime_dir, exist_ok=True)
        connection = sqlite3.connect(
            os.path.join(runtime_dir, "realtime-chat.sqlite3"),
            timeout=5,
        )
        connection.execute("PRAGMA journal_mode=WAL")
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS realtime_direct_rooms (
                id TEXT PRIMARY KEY,
                member_a TEXT NOT NULL,
                member_b TEXT NOT NULL,
                active INTEGER NOT NULL DEFAULT 1,
                accepted_at INTEGER NOT NULL,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS realtime_friendships (
                user_a TEXT NOT NULL,
                user_b TEXT NOT NULL,
                accepted_at INTEGER NOT NULL,
                PRIMARY KEY (user_a, user_b)
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS realtime_direct_messages (
                id TEXT PRIMARY KEY,
                room_id TEXT NOT NULL,
                sender_user_id TEXT NOT NULL,
                message TEXT NOT NULL,
                sent_at INTEGER NOT NULL,
                FOREIGN KEY(room_id) REFERENCES realtime_direct_rooms(id)
            )
            """
        )
        connection.execute(
            "CREATE INDEX IF NOT EXISTS idx_realtime_messages_room "
            "ON realtime_direct_messages(room_id, sent_at)"
        )
        return connection

    def _persist_room(self, wiz, room, member_user_ids):
        now = _now_ms()
        member_a, member_b = sorted(str(item) for item in member_user_ids)
        connection = self._chat_database(wiz)
        try:
            with connection:
                connection.execute(
                    """
                    INSERT INTO realtime_direct_rooms (
                        id, member_a, member_b, active,
                        accepted_at, created_at, updated_at
                    ) VALUES (?, ?, ?, 1, ?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET
                        member_a = excluded.member_a,
                        member_b = excluded.member_b,
                        active = 1,
                        accepted_at = excluded.accepted_at,
                        updated_at = excluded.updated_at
                    """,
                    (
                        room["id"],
                        member_a,
                        member_b,
                        now,
                        now,
                        now,
                    ),
                )
        finally:
            connection.close()

    def _existing_room_id(self, wiz, member_user_ids):
        member_a, member_b = sorted(str(item) for item in member_user_ids)
        connection = self._chat_database(wiz)
        try:
            row = connection.execute(
                """
                SELECT id FROM realtime_direct_rooms
                WHERE (member_a = ? AND member_b = ?)
                   OR (member_a = ? AND member_b = ?)
                ORDER BY updated_at DESC LIMIT 1
                """,
                (member_a, member_b, member_b, member_a),
            ).fetchone()
            return row[0] if row else None
        finally:
            connection.close()

    def _existing_active_room_id(self, wiz, member_user_ids):
        member_a, member_b = sorted(str(item) for item in member_user_ids)
        connection = self._chat_database(wiz)
        try:
            row = connection.execute(
                """
                SELECT id FROM realtime_direct_rooms
                WHERE active = 1 AND (
                    (member_a = ? AND member_b = ?)
                    OR (member_a = ? AND member_b = ?)
                )
                ORDER BY updated_at DESC LIMIT 1
                """,
                (member_a, member_b, member_b, member_a),
            ).fetchone()
            return row[0] if row else None
        finally:
            connection.close()

    def _close_rooms_for_pair(self, wiz, io, member_user_ids, by_id):
        member_a, member_b = sorted(str(item) for item in member_user_ids)
        connection = self._chat_database(wiz)
        try:
            with connection:
                rows = connection.execute(
                    """
                    SELECT id FROM realtime_direct_rooms
                    WHERE active = 1 AND (
                        (member_a = ? AND member_b = ?)
                        OR (member_a = ? AND member_b = ?)
                    )
                    """,
                    (member_a, member_b, member_b, member_a),
                ).fetchall()
                connection.execute(
                    """
                    UPDATE realtime_direct_rooms SET active = 0, updated_at = ?
                    WHERE (member_a = ? AND member_b = ?)
                       OR (member_a = ? AND member_b = ?)
                    """,
                    (_now_ms(), member_a, member_b, member_b, member_a),
                )
        finally:
            connection.close()
        room_ids = {str(row[0]) for row in rows}
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
        connection = self._chat_database(wiz)
        try:
            rows = connection.execute(
                """
                SELECT CASE WHEN user_a = ? THEN user_b ELSE user_a END
                FROM realtime_friendships
                WHERE user_a = ? OR user_b = ?
                """,
                (str(user_id), str(user_id), str(user_id)),
            ).fetchall()
            return {str(row[0]) for row in rows}
        finally:
            connection.close()

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
        connection = self._chat_database(wiz)
        try:
            with connection:
                connection.execute(
                    """
                    INSERT INTO realtime_friendships (user_a, user_b, accepted_at)
                    VALUES (?, ?, ?)
                    ON CONFLICT(user_a, user_b) DO UPDATE SET
                        accepted_at = excluded.accepted_at
                    """,
                    (user_a, user_b, _now_ms()),
                )
        finally:
            connection.close()

    def _remove_friendship(self, wiz, first_user_id, second_user_id):
        user_a, user_b = sorted((str(first_user_id), str(second_user_id)))
        connection = self._chat_database(wiz)
        try:
            with connection:
                connection.execute(
                    "DELETE FROM realtime_friendships WHERE user_a = ? AND user_b = ?",
                    (user_a, user_b),
                )
        finally:
            connection.close()

    def _persist_message(self, wiz, message_id, room_id, user_id, message):
        connection = self._chat_database(wiz)
        try:
            with connection:
                connection.execute(
                    """
                    INSERT INTO realtime_direct_messages (
                        id, room_id, sender_user_id, message, sent_at
                    ) VALUES (?, ?, ?, ?, ?)
                    """,
                    (message_id, room_id, str(user_id), message, _now_ms()),
                )
        finally:
            connection.close()

    def _close_persisted_room(self, wiz, room_id):
        connection = self._chat_database(wiz)
        try:
            with connection:
                connection.execute(
                    """
                    UPDATE realtime_direct_rooms
                    SET active = 0, updated_at = ?
                    WHERE id = ?
                    """,
                    (_now_ms(), room_id),
                )
        finally:
            connection.close()

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
