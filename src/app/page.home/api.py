import datetime
import html
import json
import math
import re
import secrets
import urllib.error
import urllib.parse
import urllib.request
from html.parser import HTMLParser

session = wiz.model("portal/season/session").use()
struct = wiz.model("struct")

EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
AVATAR_ID_PATTERN = re.compile(r"^[a-z0-9-]{1,64}$")
AVATAR_COLOR_PATTERN = re.compile(r"^#[0-9a-fA-F]{6}$")
AVATAR_TEXT_FIELDS = ("faceId", "hairStyleId", "topId", "bottomId", "shoesId")
AVATAR_COLOR_FIELDS = ("hairColor", "skinColor", "topColor", "bottomColor", "shoesColor")
WORLD_PORTAL_LAYOUT_ID = "shared-world-portals-v1"
WORLD_CAMERA_LAYOUT_ID = "shared-world-camera-profiles-v1"
WORLD_CAMERA_MAP_IDS = {
    "personal-farm", "town", "arts-center", "festival-experience",
    "food-experience", "club-street-festival", "bear-tree-park",
    "bear-play-zone", "garden", "campus", "student-hall",
    "recruitment-center", "project-room", "government",
    "government-central-plaza", "government-observatory", "sejong-smart-city",
}
WORLD_CAMERA_FIELD_LIMITS = {
    "characterHeight": (60, 220),
    "cameraElevationDeg": (15, 65),
    "cameraAzimuthDeg": (-180, 180),
    "cameraDistance": (500, 2400),
    "cameraTargetHeight": (0, 300),
    "cameraFov": (30, 70),
}
WORLD_PORTAL_DEFAULTS = (
    ("town", "bear-tree-park", 2122, 944),
    ("town", "campus", 1178, 122),
    ("town", "arts-center", 603, 452),
    ("town", "festival-experience", 1219, 1462),
    ("town", "food-experience", 491, 1556),
    ("arts-center", "town", 1000, 780),
    ("festival-experience", "town", 1211, 440),
    ("food-experience", "town", 1193, 546),
    ("club-street-festival", "campus", 1209, 502),
    ("bear-tree-park", "town", 1185, 1616),
    ("bear-tree-park", "garden", 767, 751),
    ("bear-tree-park", "bear-play-zone", 1482, 661),
    ("bear-play-zone", "bear-tree-park", 1200, 1650),
    ("garden", "bear-tree-park", 1218, 1585),
    ("garden", "personal-farm", 1196, 258),
    ("personal-farm", "town", 1960, 1580),
    ("personal-farm", "bear-tree-park", 1780, 1510),
    ("personal-farm", "garden", 500, 1510),
    ("campus", "town", 1120, 1731),
    ("campus", "student-hall", 881, 950),
    ("campus", "club-street-festival", 1537, 499),
    ("campus", "recruitment-center", 817, 1318),
    ("campus", "project-room", 1590, 1543),
    ("campus", "government", 368, 899),
    ("student-hall", "campus", 1200, 1660),
    ("recruitment-center", "campus", 1200, 2014),
    ("project-room", "campus", 1220, 2050),
    ("government", "campus", 1120, 1731),
    ("government", "government-central-plaza", 720, 1010),
    ("government", "government-observatory", 1680, 1010),
    ("government", "sejong-smart-city", 1200, 1190),
    ("government-central-plaza", "government", 1200, 1690),
    ("government-observatory", "government", 1200, 1790),
    ("sejong-smart-city", "government", 1200, 1690),
)
WORLD_PORTAL_KEYS = {(item[0], item[1]) for item in WORLD_PORTAL_DEFAULTS}
FROZEN_WORLD_PORTAL_MAPS = {
    "town",
    "campus",
    "arts-center",
    "festival-experience",
    "food-experience",
    "garden",
}
CANONICAL_WORLD_PORTAL_KEYS = {
    ("club-street-festival", "campus"),
    ("campus", "town"),
    ("campus", "student-hall"),
    ("campus", "club-street-festival"),
    ("campus", "recruitment-center"),
    ("campus", "project-room"),
    ("campus", "government"),
    ("recruitment-center", "campus"),
    ("project-room", "campus"),
    ("arts-center", "town"),
    ("festival-experience", "town"),
    ("food-experience", "town"),
    ("bear-tree-park", "town"),
    ("bear-tree-park", "garden"),
    ("bear-tree-park", "bear-play-zone"),
    ("garden", "bear-tree-park"),
    ("garden", "personal-farm"),
}
FOOD_SOURCE_PREVIEW_HOSTS = {
    "www.diningcode.com",
    "diningcode.com",
    "www2.sejong.go.kr",
    "www.sjlocal.or.kr",
    "sjlocal.or.kr",
}
PERFORMANCE_SOURCE_PREVIEW_HOSTS = {
    "www.sjac.or.kr",
    "sjac.or.kr",
}
FOOD_SOURCE_PREVIEW_MAX_BYTES = 2_000_000


def _food_source_preview_url(value):
    return _source_preview_url(value, FOOD_SOURCE_PREVIEW_HOSTS)


def _performance_source_preview_url(value):
    return _source_preview_url(value, PERFORMANCE_SOURCE_PREVIEW_HOSTS)


def _source_preview_url(value, allowed_hosts):
    try:
        parsed = urllib.parse.urlparse(value)
        port = parsed.port
    except (TypeError, ValueError):
        return None
    hostname = (parsed.hostname or "").lower()
    if (
        parsed.scheme != "https"
        or hostname not in allowed_hosts
        or parsed.username is not None
        or parsed.password is not None
        or port not in (None, 443)
    ):
        return None
    return value


class _FoodSourcePreviewSanitizer(HTMLParser):
    _blocked_container_tags = {
        "script",
        "noscript",
        "iframe",
        "object",
        "applet",
        "form",
        "button",
        "textarea",
        "select",
        "option",
    }
    _removed_tags = {"embed", "input"}
    _url_attributes = {"href", "src", "poster", "action"}
    _void_tags = {
        "area",
        "base",
        "br",
        "col",
        "embed",
        "hr",
        "img",
        "input",
        "link",
        "meta",
        "param",
        "source",
        "track",
        "wbr",
    }

    def __init__(self, base_url):
        super().__init__(convert_charrefs=False)
        self.base_url = base_url
        self.parts = []
        self.blocked_depth = 0
        self.head_enhanced = False

    def _safe_attributes(self, tag, attributes):
        output = []
        for raw_name, raw_value in attributes:
            name = raw_name.lower()
            value = raw_value or ""
            if (
                name.startswith("on")
                or name in {"srcdoc", "nonce", "target"}
                or (tag == "meta" and name == "http-equiv")
            ):
                continue
            if name in self._url_attributes:
                value = urllib.parse.urljoin(self.base_url, value)
                parsed = urllib.parse.urlparse(value)
                if parsed.scheme not in {"http", "https", "data"}:
                    continue
                if tag == "a" and name == "href":
                    output.append(("data-source-href", value))
                    value = "#"
            output.append((name, value))
        if tag == "a":
            output.append(("title", "현재 화면의 웹 미리보기에서는 링크 이동을 지원하지 않습니다."))
        return output

    def handle_starttag(self, tag, attributes):
        tag = tag.lower()
        if tag in self._blocked_container_tags:
            self.blocked_depth += 1
            return
        if self.blocked_depth or tag in self._removed_tags:
            return
        if tag == "base":
            return
        if tag == "meta" and any(
            name.lower() == "http-equiv" and (value or "").lower() == "refresh"
            for name, value in attributes
        ):
            return
        rendered = "".join(
            f' {name}="{html.escape(value, quote=True)}"'
            for name, value in self._safe_attributes(tag, attributes)
        )
        self.parts.append(f"<{tag}{rendered}>")
        if tag == "head" and not self.head_enhanced:
            self.head_enhanced = True
            self.parts.append(
                '<base href="%s"><style>'
                'html,body{min-height:100%%;background:#fff}'
                'body{margin:0;overflow:auto}'
                'a[data-source-href]{cursor:default}'
                '</style>' % html.escape(self.base_url, quote=True)
            )

    def handle_startendtag(self, tag, attributes):
        previous_blocked_depth = self.blocked_depth
        self.handle_starttag(tag, attributes)
        if tag.lower() in self._blocked_container_tags:
            self.blocked_depth = previous_blocked_depth
            return
        if tag.lower() not in self._void_tags and not self.blocked_depth:
            self.parts.append(f"</{tag.lower()}>")

    def handle_endtag(self, tag):
        tag = tag.lower()
        if tag in self._blocked_container_tags:
            self.blocked_depth = max(0, self.blocked_depth - 1)
            return
        if not self.blocked_depth and tag != "base":
            self.parts.append(f"</{tag}>")

    def handle_data(self, data):
        if not self.blocked_depth:
            self.parts.append(data)

    def handle_entityref(self, name):
        if not self.blocked_depth:
            self.parts.append(f"&{name};")

    def handle_charref(self, name):
        if not self.blocked_depth:
            self.parts.append(f"&#{name};")

    def handle_decl(self, declaration):
        if not self.blocked_depth:
            self.parts.append(f"<!{declaration}>")


def _source_preview_response(source_url, validate_url, invalid_message):
    source_url = validate_url(source_url)
    if source_url is None:
        return wiz.response.status(
            400,
            message=invalid_message,
        )

    request = urllib.request.Request(
        source_url,
        headers={
            "Accept": "text/html,application/xhtml+xml",
            "Accept-Encoding": "identity",
            "User-Agent": (
                "Mozilla/5.0 (X11; Linux x86_64) "
                "AppleWebKit/537.36 Chrome/131 Safari/537.36"
            ),
        },
        method="GET",
    )
    try:
        with urllib.request.urlopen(request, timeout=12) as response:
            final_url = validate_url(response.geturl())
            if final_url is None:
                raise ValueError("untrusted redirect")
            content_type = response.headers.get_content_type()
            if content_type not in {"text/html", "application/xhtml+xml"}:
                raise ValueError("unsupported content type")
            payload = response.read(FOOD_SOURCE_PREVIEW_MAX_BYTES + 1)
            if len(payload) > FOOD_SOURCE_PREVIEW_MAX_BYTES:
                raise ValueError("source page too large")
            charset = response.headers.get_content_charset() or "utf-8"
            document = payload.decode(charset, errors="replace")
    except (urllib.error.URLError, ValueError, LookupError):
        return wiz.response.status(
            502,
            message="원본 페이지를 현재 화면으로 불러오지 못했어요.",
        )

    sanitizer = _FoodSourcePreviewSanitizer(final_url)
    sanitizer.feed(document)
    sanitizer.close()
    return wiz.response.status(
        200,
        html="".join(sanitizer.parts),
        sourceUrl=final_url,
    )


def _food_source_preview_response(source_url):
    return _source_preview_response(
        source_url,
        _food_source_preview_url,
        "허용된 먹거리 정보 출처만 확인할 수 있어요.",
    )


def _performance_source_preview_response(source_url):
    return _source_preview_response(
        source_url,
        _performance_source_preview_url,
        "허용된 공연 정보 출처만 확인할 수 있어요.",
    )


def food_source_preview():
    return _food_source_preview_response(
        wiz.request.query("url", "").strip()
    )


def _secret_config():
    try:
        return wiz.config("secret")
    except Exception:
        return None


def _secret_configured(config, name):
    if config is None:
        return False
    try:
        value = getattr(config, name)
    except Exception:
        return False
    return isinstance(value, str) and bool(value.strip())


def api_config_status():
    config = _secret_config()
    return wiz.response.status(
        200,
        providers={
            "openai": _secret_configured(config, "OPENAI_API_KEY"),
            "kakao": _secret_configured(config, "KAKAO_REST_API_KEY"),
            "sejong": _secret_configured(config, "SEJONG_API_KEY"),
            "tour": _secret_configured(config, "TOUR_API_KEY"),
        },
        upstream=_secret_configured(config, "UPSTREAM_API_URL"),
        configLoaded=config is not None,
    )


def _credentials():
    email = wiz.request.query("email", "").strip().lower()
    password = wiz.request.query("password", "")
    return email, password


def _set_session(user):
    session.set(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        role=user["role"],
    )


def signup():
    email, password = _credentials()

    if not EMAIL_PATTERN.match(email) or len(email) > 128:
        return wiz.response.status(400, message="올바른 이메일 주소를 입력해 주세요.")
    if len(password) < 8 or len(password.encode("utf-8")) > 72:
        return wiz.response.status(400, message="비밀번호는 8자 이상 72바이트 이하로 입력해 주세요.")

    try:
        if struct.user.db.get(email=email) is not None:
            return wiz.response.status(409, message="이미 가입된 이메일입니다.")

        user_id = struct.user.create({
            "email": email,
            "password": password,
            "name": email.split("@", 1)[0][:50],
            "role": "user",
        })
        user = struct.user.get(user_id)
    except Exception:
        if struct.user.db.get(email=email) is not None:
            return wiz.response.status(409, message="이미 가입된 이메일입니다.")
        return wiz.response.status(503, message="회원가입을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.")

    _set_session(user)
    return wiz.response.status(200, user=user)


def login():
    if (
        wiz.request.query("code", "")
        or wiz.request.query("state", "")
        or wiz.request.query("error", "")
    ):
        return _kakao_callback()

    email, password = _credentials()

    if not email or not password:
        return wiz.response.status(400, message="이메일과 비밀번호를 입력해 주세요.")

    try:
        user = struct.user.authenticate(email, password)
    except Exception:
        return wiz.response.status(503, message="로그인을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.")

    if user is None:
        return wiz.response.status(401, message="이메일 또는 비밀번호가 올바르지 않습니다.")

    _set_session(user)
    return wiz.response.status(200, user=user)


def me():
    user_id = session.get("id")
    if not user_id:
        return wiz.response.status(200, user=None)

    try:
        user = struct.user.get(user_id)
    except Exception:
        return wiz.response.status(503, message="로그인 정보를 확인하지 못했습니다.")

    if user is None:
        session.clear()
    return wiz.response.status(200, user=user)


ACCOUNT_PROFILE_MAX_BYTES = 16000
ACCOUNT_PROFILE_MODELS = {
    "custom",
    "chungnyeong",
    "girl1",
    "boy1",
    "cloths",
    "women",
}


def _account_profile_text(value, maximum, allow_empty=False):
    if not isinstance(value, str):
        return None
    value = value.strip()
    if (not value and not allow_empty) or len(value) > maximum:
        return None
    return value


def _account_profile_list(value):
    if not isinstance(value, list) or len(value) > 30:
        return None
    normalized = []
    for item in value:
        item = _account_profile_text(item, 50)
        if item is None:
            return None
        normalized.append(item)
    return normalized


def _normalize_account_profile(value):
    if not isinstance(value, dict):
        return None

    nickname = _account_profile_text(value.get("nickname"), 30)
    mbti = _account_profile_text(value.get("mbti", ""), 10, allow_empty=True)
    model = value.get("model")
    character = value.get("character")
    if (
        nickname is None
        or mbti is None
        or model not in ACCOUNT_PROFILE_MODELS
        or not isinstance(character, dict)
    ):
        return None

    interests = _account_profile_list(value.get("interests"))
    usage_purposes = _account_profile_list(value.get("usagePurposes"))
    place_categories = _account_profile_list(
        value.get("preferredPlaceCategories")
    )
    if (
        interests is None
        or usage_purposes is None
        or place_categories is None
    ):
        return None

    normalized_character = {}
    for field in ("hair", "face", "top", "bottom", "shoes"):
        item = _account_profile_text(character.get(field), 80)
        if item is None:
            return None
        normalized_character[field] = item

    for field in ("topLayer", "accessory"):
        item = character.get(field)
        if item is not None:
            item = _account_profile_text(item, 80, allow_empty=True)
            if item is None:
                return None
            normalized_character[field] = item

    character_options = {
        "hairStyle": {"hair1", "hair2", "both"},
        "topStyle": {"style1", "style2"},
        "bottomStyle": {"style1", "style2"},
        "shoesStyle": {"style1", "style2"},
        "outfitStyle": {"outfit1", "outfit2"},
    }
    for field, allowed in character_options.items():
        item = character.get(field)
        if item is not None:
            if item not in allowed:
                return None
            normalized_character[field] = item

    profile = {
        "nickname": nickname,
        "mbti": mbti,
        "interests": interests,
        "usagePurposes": usage_purposes,
        "preferredPlaceCategories": place_categories,
        "recordVisibility": value.get("recordVisibility", "public"),
        "chatEnabled": value.get("chatEnabled", True),
        "model": model,
        "character": normalized_character,
    }
    if profile["recordVisibility"] not in ("public", "private"):
        return None
    if not isinstance(profile["chatEnabled"], bool):
        return None

    for field in ("residence", "sejongVisitExperience"):
        item = value.get(field)
        if item is not None:
            item = _account_profile_text(item, 30)
            if item is None:
                return None
            profile[field] = item
    return profile


def account_profile():
    user_id = session.get("id")
    if not user_id:
        return wiz.response.status(401, message="카카오 로그인이 필요합니다.")

    try:
        user = struct.user.get(user_id)
    except Exception:
        return wiz.response.status(503, message="저장된 프로필을 확인하지 못했습니다.")
    if user is None:
        session.clear()
        return wiz.response.status(404, message="사용자 정보를 찾지 못했습니다.")

    payload_raw = wiz.request.query("profile", "")
    if not payload_raw:
        profile = None
        stored = user.get("avatar") or ""
        if isinstance(stored, str) and stored:
            try:
                profile = _normalize_account_profile(json.loads(stored))
            except (TypeError, ValueError, json.JSONDecodeError):
                profile = None
        return wiz.response.status(200, profile=profile)

    if (
        not isinstance(payload_raw, str)
        or len(payload_raw.encode("utf-8")) > ACCOUNT_PROFILE_MAX_BYTES
    ):
        return wiz.response.status(413, message="프로필 데이터가 너무 큽니다.")
    try:
        profile = _normalize_account_profile(json.loads(payload_raw))
    except (TypeError, ValueError, json.JSONDecodeError):
        profile = None
    if profile is None:
        return wiz.response.status(400, message="프로필 형식이 올바르지 않습니다.")

    serialized = json.dumps(
        profile,
        ensure_ascii=False,
        separators=(",", ":"),
    )
    try:
        struct.user.update_profile(
            user_id,
            name=profile["nickname"],
            avatar=serialized,
        )
    except Exception:
        return wiz.response.status(503, message="프로필을 서버에 저장하지 못했습니다.")
    return wiz.response.status(200, profile=profile)


def _world_portal_editor():
    user_id = session.get("id")
    if not user_id:
        return None
    user = struct.user.get(user_id)
    if user and user.get("role") in ("admin", "portal_editor"):
        return user
    return None


def _default_world_portals():
    return [
        {"mapId": map_id, "destination": destination, "x": x, "z": z}
        for map_id, destination, x, z in WORLD_PORTAL_DEFAULTS
    ]


def _saved_world_portals(db):
    record = db.get(id=WORLD_PORTAL_LAYOUT_ID)
    if record is None:
        return _default_world_portals()
    try:
        positions = json.loads(record.get("payload") or "[]")
    except (TypeError, ValueError, json.JSONDecodeError):
        return _default_world_portals()
    if not isinstance(positions, list):
        return _default_world_portals()
    valid = {}
    for position in positions:
        if not isinstance(position, dict):
            continue
        key = (position.get("mapId"), position.get("destination"))
        x, z = position.get("x"), position.get("z")
        if (
            key in WORLD_PORTAL_KEYS
            and key not in CANONICAL_WORLD_PORTAL_KEYS
            and isinstance(x, (int, float))
            and isinstance(z, (int, float))
            and math.isfinite(x)
            and math.isfinite(z)
            and 0 <= x <= 4800
            and 0 <= z <= 2600
        ):
            valid[key] = {
                "mapId": key[0],
                "destination": key[1],
                "x": round(x),
                "z": round(z),
            }
    merged = {
        (position["mapId"], position["destination"]): position
        for position in _default_world_portals()
    }
    merged.update(valid)
    return list(merged.values())


def portal_positions():
    payload = wiz.request.query("payload", "")
    if isinstance(payload, dict):
        routed_payload = payload
    else:
        try:
            routed_payload = json.loads(payload) if payload else None
        except (TypeError, ValueError, json.JSONDecodeError):
            routed_payload = None
    if isinstance(routed_payload, dict) and routed_payload.get("resource") == "worldCameraProfiles":
        camera_payload = routed_payload.get("profile")
        serialized_camera_payload = "" if camera_payload is None else json.dumps(camera_payload, ensure_ascii=False)
        return camera_profiles(serialized_camera_payload)
    source_preview_url = wiz.request.query("foodSourceUrl", "").strip()
    if source_preview_url:
        return _food_source_preview_response(source_preview_url)
    performance_preview_url = wiz.request.query("performanceSourceUrl", "").strip()
    if performance_preview_url:
        return _performance_source_preview_response(performance_preview_url)

    db = struct.db("world_portal_layout")
    db.orm.create_table(safe=True)
    editor = _world_portal_editor()
    if not payload:
        return wiz.response.status(
            200,
            positions=_saved_world_portals(db),
            canEdit=editor is not None,
        )

    if editor is None:
        return wiz.response.status(403, message="포탈 위치를 변경할 권한이 없어요.")

    try:
        position = json.loads(payload)
    except (TypeError, ValueError, json.JSONDecodeError):
        return wiz.response.status(400, message="포탈 위치 값이 올바르지 않아요.")

    if not isinstance(position, dict):
        return wiz.response.status(400, message="포탈 위치 값이 올바르지 않아요.")
    key = (position.get("mapId"), position.get("destination"))
    x, z = position.get("x"), position.get("z")
    if key[0] in FROZEN_WORLD_PORTAL_MAPS or key in CANONICAL_WORLD_PORTAL_KEYS:
        return wiz.response.status(403, message="현재 맵의 포탈 위치는 고정되어 있어요.")
    if (
        key not in WORLD_PORTAL_KEYS
        or not isinstance(x, (int, float))
        or not isinstance(z, (int, float))
        or not math.isfinite(x)
        or not math.isfinite(z)
        or not 0 <= x <= 4800
        or not 0 <= z <= 2600
    ):
        return wiz.response.status(400, message="현재 위치에는 포탈을 저장할 수 없어요.")

    normalized = {
        "mapId": key[0],
        "destination": key[1],
        "x": round(x),
        "z": round(z),
    }
    positions = _saved_world_portals(db)
    positions = [
        normalized
        if (item["mapId"], item["destination"]) == key
        else item
        for item in positions
    ]
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    record = db.get(id=WORLD_PORTAL_LAYOUT_ID)
    values = {
        "payload": json.dumps(positions, ensure_ascii=False, separators=(",", ":")),
        "updated_by": editor["id"],
        "updated": now,
    }
    if record is None:
        db.insert({"id": WORLD_PORTAL_LAYOUT_ID, "created": now, **values})
    else:
        db.update(values, id=WORLD_PORTAL_LAYOUT_ID)
    return wiz.response.status(
        200,
        position=normalized,
        positions=positions,
        canEdit=True,
        message="모든 사용자에게 적용되는 포탈 위치로 저장했어요.",
    )


def _saved_world_camera_profiles(db):
    record = db.get(id=WORLD_CAMERA_LAYOUT_ID)
    if record is None:
        return []
    try:
        profiles = json.loads(record.get("payload") or "[]")
    except (TypeError, ValueError, json.JSONDecodeError):
        return []
    if not isinstance(profiles, list):
        return []
    valid = {}
    for profile in profiles:
        if not isinstance(profile, dict) or profile.get("mapId") not in WORLD_CAMERA_MAP_IDS:
            continue
        normalized = {"mapId": profile["mapId"]}
        for field, limits in WORLD_CAMERA_FIELD_LIMITS.items():
            value = profile.get(field)
            if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value) or not limits[0] <= value <= limits[1]:
                normalized = None
                break
            normalized[field] = round(value, 2)
        if normalized is not None:
            valid[normalized["mapId"]] = normalized
    return list(valid.values())


def camera_profiles(payload=None):
    db = struct.db("world_camera_profiles")
    db.orm.create_table(safe=True)
    editor = _world_portal_editor()
    if payload is None:
        payload = wiz.request.query("payload", "")
    profiles = _saved_world_camera_profiles(db)

    if not payload:
        return wiz.response.status(200, profiles=profiles, canEdit=editor is not None)
    if editor is None:
        return wiz.response.status(403, message="카메라 설정을 변경할 권한이 없어요.")

    try:
        candidate = json.loads(payload)
    except (TypeError, ValueError, json.JSONDecodeError):
        return wiz.response.status(400, message="카메라 설정 값이 올바르지 않아요.")
    if not isinstance(candidate, dict) or candidate.get("mapId") not in WORLD_CAMERA_MAP_IDS:
        return wiz.response.status(400, message="카메라 설정 맵이 올바르지 않아요.")

    map_id = candidate["mapId"]
    normalized = None
    if candidate.get("reset") is True:
        profiles = [item for item in profiles if item["mapId"] != map_id]
        message = "이 맵의 기본 카메라 설정으로 되돌렸어요."
    else:
        normalized = {"mapId": map_id}
        for field, limits in WORLD_CAMERA_FIELD_LIMITS.items():
            value = candidate.get(field)
            if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value) or not limits[0] <= value <= limits[1]:
                return wiz.response.status(400, message="카메라 설정 범위를 확인해 주세요.")
            normalized[field] = round(value, 2)
        profiles = [normalized if item["mapId"] == map_id else item for item in profiles]
        if not any(item["mapId"] == map_id for item in profiles):
            profiles.append(normalized)
        message = "모든 사용자에게 적용되는 카메라 설정으로 저장했어요."

    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    record = db.get(id=WORLD_CAMERA_LAYOUT_ID)
    values = {
        "payload": json.dumps(profiles, ensure_ascii=False, separators=(",", ":")),
        "updated_by": editor["id"],
        "updated": now,
    }
    if record is None:
        db.insert({"id": WORLD_CAMERA_LAYOUT_ID, "created": now, **values})
    else:
        db.update(values, id=WORLD_CAMERA_LAYOUT_ID)
    return wiz.response.status(200, profile=normalized, profiles=profiles, canEdit=True, message=message)


def _validated_avatar():
    value = wiz.request.query("avatar", "")
    if isinstance(value, str):
        if len(value.encode("utf-8")) > 4096:
            return None
        try:
            value = json.loads(value)
        except Exception:
            return None
    if not isinstance(value, dict):
        return None

    base_model_id = value.get("baseModelId")
    if not isinstance(base_model_id, str) or not AVATAR_ID_PATTERN.match(base_model_id):
        return None

    avatar = {"baseModelId": base_model_id}
    for field in AVATAR_TEXT_FIELDS:
        field_value = value.get(field)
        if not isinstance(field_value, str) or not AVATAR_ID_PATTERN.match(field_value):
            return None
        avatar[field] = field_value

    for field in AVATAR_COLOR_FIELDS:
        field_value = value.get(field)
        if not isinstance(field_value, str) or not AVATAR_COLOR_PATTERN.match(field_value):
            return None
        avatar[field] = field_value.lower()

    accessories = value.get("accessoryIds", [])
    if not isinstance(accessories, list) or len(accessories) > 1:
        return None
    if any(not isinstance(item, str) or not AVATAR_ID_PATTERN.match(item) for item in accessories):
        return None
    avatar["accessoryIds"] = accessories
    return avatar


def save_avatar():
    user_id = session.get("id")
    if not user_id:
        return wiz.response.status(401, message="로그인이 필요합니다.")

    avatar = _validated_avatar()
    if avatar is None:
        return wiz.response.status(400, message="캐릭터 설정이 올바르지 않습니다.")

    serialized = json.dumps(avatar, ensure_ascii=False, separators=(",", ":"))
    try:
        struct.user.update_profile(user_id, avatar=serialized)
    except Exception:
        return wiz.response.status(503, message="캐릭터 설정을 저장하지 못했습니다.")

    return wiz.response.status(200, avatar=serialized)


def logout():
    session.clear()
    return wiz.response.status(200)

def _public_origin():
    flask = wiz.server.package.flask
    request = flask.request
    scheme = request.headers.get("X-Forwarded-Proto", request.scheme).split(",", 1)[0].strip()
    host = request.headers.get("X-Forwarded-Host", request.host).split(",", 1)[0].strip()
    if scheme not in ("http", "https") or not re.match(r"^[A-Za-z0-9.:-]+$", host):
        return ""
    return f"{scheme}://{host}"


def _kakao_callback_url():
    origin = _public_origin()
    return f"{origin}/wiz/api/page.home/login" if origin else ""


def kakao_start():
    config = _secret_config()
    client_id = (
        getattr(config, "KAKAO_REST_API_KEY", "")
        if config is not None
        else ""
    )
    redirect_uri = _kakao_callback_url()

    if not client_id or not redirect_uri:
        return _login_redirect(
            "error",
            message="카카오 로그인 설정을 확인해 주세요.",
        )

    state = secrets.token_urlsafe(24)
    session.set(kakao_oauth_state=state)
    params = {
        "client_id": client_id.strip(),
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "state": state,
        # A previous Kakao session must not skip visible account
        # authentication before the onboarding flow.
        "prompt": "login",
    }

    scopes = getattr(config, "KAKAO_LOGIN_SCOPES", "") or ""
    scopes = ",".join(
        scope.strip()
        for scope in scopes.split(",")
        if scope.strip()
    )
    if scopes:
        params["scope"] = scopes

    service_terms = getattr(config, "KAKAO_SERVICE_TERMS", "") or ""
    service_terms = ",".join(
        term.strip()
        for term in service_terms.split(",")
        if term.strip()
    )
    if service_terms:
        params["service_terms"] = service_terms

    authorization_url = (
        "https://kauth.kakao.com/oauth/authorize?"
        + urllib.parse.urlencode(params)
    )
    return wiz.response.redirect(authorization_url)


def _kakao_request_json(url, data=None, headers=None):
    request = urllib.request.Request(
        url,
        data=data,
        headers=headers or {},
        method="POST" if data is not None else "GET",
    )
    with urllib.request.urlopen(request, timeout=10) as response:
        return json.loads(response.read().decode("utf-8"))


def _unlink_kakao_user(user):
    email = str(user.get("email") or "").strip().lower()
    match = re.match(
        r"^kakao-([1-9][0-9]{0,19})@oauth\\.local$",
        email,
    )
    if match is None:
        return None

    config = _secret_config()
    admin_key = (
        getattr(config, "KAKAO_ADMIN_KEY", "")
        if config is not None
        else ""
    )
    if not isinstance(admin_key, str) or not admin_key.strip():
        return None

    kakao_user_id = match.group(1)
    try:
        result = _kakao_request_json(
            "https://kapi.kakao.com/v1/user/unlink",
            data=urllib.parse.urlencode({
                "target_id_type": "user_id",
                "target_id": kakao_user_id,
            }).encode("utf-8"),
            headers={
                "Authorization": f"KakaoAK {admin_key.strip()}",
                "Content-Type":
                    "application/x-www-form-urlencoded;charset=utf-8",
            },
        )
        return str(result.get("id") or "") == kakao_user_id
    except (
        urllib.error.URLError,
        ValueError,
        KeyError,
        TypeError,
        json.JSONDecodeError,
    ):
        return False


def withdraw():
    user_id = session.get("id")
    if not user_id:
        return wiz.response.status(
            401,
            message="로그인이 필요합니다.",
        )

    try:
        user = struct.user.get(user_id)
    except Exception:
        return wiz.response.status(
            503,
            message="회원 정보를 확인하지 못했습니다.",
        )

    if user is None:
        session.clear()
        return wiz.response.status(
            404,
            message="이미 삭제된 계정입니다.",
        )

    kakao_unlinked = _unlink_kakao_user(user)

    try:
        struct.user.delete_account(user_id)
    except Exception:
        return wiz.response.status(
            503,
            message="회원 탈퇴를 처리하지 못했습니다.",
        )

    session.clear()
    return wiz.response.status(
        200,
        deleted=True,
        kakaoUnlinked=kakao_unlinked,
    )


def _login_redirect(status, **params):
    query = {"login": status}
    query.update(params)
    target_url = (
        "/assets/jochwon-app/index.html?"
        + urllib.parse.urlencode(query)
    )
    payload = {
        "type": "sejong-kakao-login",
        "status": status,
    }
    payload.update(params)
    payload_json = json.dumps(
        payload,
        ensure_ascii=False,
        separators=(",", ":"),
    ).replace("</", "<\\/")
    target_json = json.dumps(target_url)
    heading = (
        "로그인이 완료됐어요."
        if status == "success"
        else "로그인을 완료하지 못했어요."
    )
    html = """<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>카카오 로그인 완료</title>
<style>
body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f7faf8;color:#163e3b;font-family:system-ui,sans-serif}
main{text-align:center;padding:32px}b{display:block;margin-bottom:8px;font-size:20px}p{margin:0;color:#637a74}
</style>
</head>
<body>
<main><b>__HEADING__</b><p>원래 화면으로 돌아가는 중입니다.</p></main>
<script>
(function () {
  var payload = __PAYLOAD__;
  var fallback = __TARGET__;
  var acknowledged = false;

  function receiveAcknowledgement(event) {
    if (
      event.data &&
      event.data.type === "sejong-kakao-login-ack"
    ) {
      acknowledged = true;
      window.close();
    }
  }

  if (window.opener && !window.opener.closed) {
    window.addEventListener(
      "message",
      receiveAcknowledgement
    );
    window.opener.postMessage(payload, "*");
    window.setTimeout(function () {
      if (!acknowledged) {
        window.location.replace(fallback);
      }
    }, 1200);
    return;
  }

  window.location.replace(fallback);
}());
</script>
</body>
</html>""".replace("__HEADING__", heading).replace("__PAYLOAD__", payload_json).replace("__TARGET__", target_json)
    return wiz.response.send(
        html,
        content_type="text/html; charset=utf-8",
    )


def _kakao_callback():
    config = _secret_config()
    client_id = getattr(config, "KAKAO_REST_API_KEY", "") if config is not None else ""
    client_secret = getattr(config, "KAKAO_CLIENT_SECRET", "") if config is not None else ""
    redirect_uri = _kakao_callback_url()
    code = wiz.request.query("code", "")
    state = wiz.request.query("state", "")
    provider_error = wiz.request.query("error", "")
    expected_state = session.get("kakao_oauth_state", "")
    if session.has("kakao_oauth_state"):
        session.delete("kakao_oauth_state")

    error_message = ""
    user = None
    kakao_user_id = ""
    nickname = ""
    profile_image = ""

    if provider_error:
        error_message = "카카오 로그인이 취소되었습니다."
    elif (
        not code
        or not state
        or not expected_state
        or not secrets.compare_digest(state, expected_state)
    ):
        error_message = "로그인 요청이 만료되었습니다. 다시 시도해 주세요."
    elif not client_id or not redirect_uri:
        error_message = "카카오 로그인 설정을 확인해 주세요."
    else:
        try:
            token_data = {
                "grant_type": "authorization_code",
                "client_id": client_id.strip(),
                "redirect_uri": redirect_uri,
                "code": code,
            }
            if client_secret:
                token_data["client_secret"] = client_secret.strip()

            token = _kakao_request_json(
                "https://kauth.kakao.com/oauth/token",
                data=urllib.parse.urlencode(token_data).encode("utf-8"),
                headers={
                    "Content-Type":
                    "application/x-www-form-urlencoded;charset=utf-8"
                },
            )
            access_token = token.get("access_token", "")
            if not access_token:
                raise ValueError("missing access token")

            kakao_user = _kakao_request_json(
                "https://kapi.kakao.com/v2/user/me",
                headers={"Authorization": f"Bearer {access_token}"},
            )
            kakao_user_id = str(kakao_user.get("id", "")).strip()
            if not kakao_user_id:
                raise ValueError("missing kakao user id")

            account = kakao_user.get("kakao_account") or {}
            account_profile = account.get("profile") or {}
            properties = kakao_user.get("properties") or {}
            nickname = (
                account_profile.get("nickname")
                or properties.get("nickname")
                or "카카오 사용자"
            ).strip()[:50]
            profile_image = (
                account_profile.get("profile_image_url")
                or properties.get("profile_image")
                or ""
            ).strip()

            email = f"kakao-{kakao_user_id}@oauth.local"
            user = struct.user.db.get(email=email)
            if user is None:
                try:
                    user_id = struct.user.create({
                        "email": email,
                        "password": secrets.token_urlsafe(32),
                        "name": nickname,
                        "role": "user",
                    })
                    user = struct.user.get(user_id)
                except Exception:
                    user = struct.user.db.get(email=email)

            if user is None:
                raise ValueError("failed to save kakao user")
            user.pop("password", None)
        except (
            urllib.error.URLError,
            ValueError,
            KeyError,
            TypeError,
            json.JSONDecodeError,
        ):
            error_message = (
                "카카오 로그인 처리에 실패했습니다. "
                "잠시 후 다시 시도해 주세요."
            )
        except Exception:
            error_message = (
                "로그인 정보를 저장하지 못했습니다. "
                "잠시 후 다시 시도해 주세요."
            )

    if error_message:
        return _login_redirect("error", message=error_message)

    _set_session(user)
    return _login_redirect(
        "success",
        userId=kakao_user_id,
        nickname=nickname,
        profileImage=profile_image,
    )


PERSONAL_FARM_FLOWERS = (
    "magnolia", "adonis", "azalea", "hydrangea", "tulip", "iris", "lily",
    "camellia", "sunflower", "gujeolcho", "hibiscus", "bird-of-paradise",
    "peach-tree", "maple-tree",
)
PERSONAL_FARM_REQUIRED_FLOWERS = (
    "hydrangea", "tulip", "iris", "camellia", "sunflower"
)
PERSONAL_FARM_FLOWER_BED_LIMIT = 5
PERSONAL_FARM_FEEDS = ("apple", "carrot", "acorn")
PERSONAL_FARM_FEED_SPOTS = tuple(
    f"BEAR_FEED_SPOT_0{index}" for index in range(1, 6)
)
PERSONAL_FARM_FEED_BY_SPOT = {
    "BEAR_FEED_SPOT_01": "apple",
    "BEAR_FEED_SPOT_02": "carrot",
    "BEAR_FEED_SPOT_03": "acorn",
    "BEAR_FEED_SPOT_04": "apple",
    "BEAR_FEED_SPOT_05": "carrot",
}
PERSONAL_FARM_REWARDS = (
    "flower-garden",
    "bear-statue",
    "nature-complete-emblem",
    "real-visit-missions-unlocked",
    "nature-chapter-complete",
)


def _personal_farm_default(now=None):
    timestamp = (now or datetime.datetime.now()).isoformat()
    visit = {
        "status": "locked",
        "submittedAt": None,
        "reviewedAt": None,
        "metadata": {},
        "file": None,
    }
    return {
        "gardenMission": {
            "collectedFlowerIds": [],
            "plantedFlowerIds": [],
            "completed": False,
            "completedAt": None,
            "completedFlowerIds": [],
            "requiredFlowerCount": PERSONAL_FARM_FLOWER_BED_LIMIT,
            "interestCompleted": False,
            "interestCompletedAt": None,
        },
        "bearMission": {
            "collectedFeedIds": [],
            "completedFeedSpotIds": [],
            "fedFeedSpotIds": [],
            "bearFed": False,
            "bearFedAt": None,
            "completed": False,
            "completedAt": None,
        },
        "farm": {
            "unlocked": False,
            "unlockedRewardIds": [],
            "activeRewardIds": [],
            "bearGrowthStage": "locked",
        },
        "natureChapter": {
            "gardenCompleted": False,
            "bearTreeCompleted": False,
            "completed": False,
            "completedAt": None,
            "noticeShown": False,
        },
        "realVisit": {"garden": dict(visit), "bearTree": dict(visit)},
        "layoutVersion": 1,
        "createdAt": timestamp,
        "updatedAt": timestamp,
    }


def _personal_farm_allowed_list(value, allowed):
    if not isinstance(value, list):
        return []
    return list(dict.fromkeys(item for item in value if item in allowed))


def _normalize_personal_farm(value):
    result = _personal_farm_default()
    if not isinstance(value, dict):
        return result
    garden = value.get("gardenMission") or {}
    bear = value.get("bearMission") or {}
    farm = value.get("farm") or {}
    visits = value.get("realVisit") or {}
    nature = value.get("natureChapter") or {}
    result["gardenMission"]["collectedFlowerIds"] = _personal_farm_allowed_list(
        garden.get("collectedFlowerIds"), PERSONAL_FARM_FLOWERS
    )
    result["gardenMission"]["plantedFlowerIds"] = _personal_farm_allowed_list(
        garden.get("plantedFlowerIds"), PERSONAL_FARM_FLOWERS
    )[:PERSONAL_FARM_FLOWER_BED_LIMIT]
    result["bearMission"]["collectedFeedIds"] = _personal_farm_allowed_list(
        bear.get("collectedFeedIds"), PERSONAL_FARM_FEEDS
    )
    result["bearMission"]["completedFeedSpotIds"] = _personal_farm_allowed_list(
        bear.get("completedFeedSpotIds"), PERSONAL_FARM_FEED_SPOTS
    )
    fed_feed_spot_ids = _personal_farm_allowed_list(
        bear.get("fedFeedSpotIds"), PERSONAL_FARM_FEED_SPOTS
    )
    if bear.get("bearFed") is True and not fed_feed_spot_ids:
        fed_feed_spot_ids = list(result["bearMission"]["completedFeedSpotIds"])
    result["bearMission"]["fedFeedSpotIds"] = [
        item for item in fed_feed_spot_ids
        if item in result["bearMission"]["completedFeedSpotIds"]
    ]
    result["bearMission"]["bearFed"] = bear.get("bearFed") is True
    if isinstance(bear.get("bearFedAt"), str):
        result["bearMission"]["bearFedAt"] = bear["bearFedAt"]
    if isinstance(garden.get("interestCompletedAt"), str):
        result["gardenMission"]["interestCompletedAt"] = garden["interestCompletedAt"]
    result["farm"]["activeRewardIds"] = _personal_farm_allowed_list(
        farm.get("activeRewardIds"), PERSONAL_FARM_REWARDS
    )
    for section in ("gardenMission", "bearMission"):
        completed_at = (value.get(section) or {}).get("completedAt")
        if isinstance(completed_at, str):
            result[section]["completedAt"] = completed_at
    for mission in ("garden", "bearTree"):
        source = visits.get(mission) if isinstance(visits, dict) else None
        if not isinstance(source, dict):
            continue
        status = source.get("status")
        if status in ("locked", "available", "submitted", "verified", "rejected"):
            result["realVisit"][mission]["status"] = status
        for field in ("submittedAt", "reviewedAt"):
            if isinstance(source.get(field), str):
                result["realVisit"][mission][field] = source[field]
        metadata = source.get("metadata")
        if isinstance(metadata, dict):
            result["realVisit"][mission]["metadata"] = {
                str(key)[:40]: str(item)[:300]
                for key, item in list(metadata.items())[:20]
            }
        file_data = source.get("file")
        if isinstance(file_data, dict):
            original_name = file_data.get("originalName")
            mime_type = file_data.get("mimeType")
            size = file_data.get("size")
            if isinstance(original_name, str) and isinstance(mime_type, str) and isinstance(size, int):
                result["realVisit"][mission]["file"] = {
                    "originalName": original_name[:200],
                    "mimeType": mime_type[:100],
                    "size": max(0, size),
                }
    if isinstance(nature, dict):
        if isinstance(nature.get("completedAt"), str):
            result["natureChapter"]["completedAt"] = nature["completedAt"]
        result["natureChapter"]["noticeShown"] = nature.get("noticeShown") is True
    created_at = value.get("createdAt")
    if isinstance(created_at, str):
        result["createdAt"] = created_at
    return result


def _apply_personal_farm_rules(progress, now=None):
    timestamp = (now or datetime.datetime.now()).isoformat()
    garden = progress["gardenMission"]
    bear = progress["bearMission"]
    garden_complete = all(
        item in garden["collectedFlowerIds"]
        for item in PERSONAL_FARM_REQUIRED_FLOWERS
    ) and len(garden["plantedFlowerIds"]) == PERSONAL_FARM_FLOWER_BED_LIMIT
    bear["fedFeedSpotIds"] = list(dict.fromkeys(
        item for item in bear.get("fedFeedSpotIds", [])
        if item in bear["completedFeedSpotIds"] and item in PERSONAL_FARM_FEED_SPOTS
    ))
    bear_complete = all(
        item in bear["fedFeedSpotIds"] for item in PERSONAL_FARM_FEED_SPOTS
    )
    bear["bearFed"] = bear_complete
    if not bear_complete:
        bear["bearFedAt"] = None
    if garden_complete and not garden.get("completedAt"):
        garden["completedAt"] = timestamp
    if bear_complete and not bear.get("completedAt"):
        bear["completedAt"] = timestamp
    garden["completed"] = garden_complete
    garden["completedFlowerIds"] = list(garden["collectedFlowerIds"])
    garden["requiredFlowerCount"] = PERSONAL_FARM_FLOWER_BED_LIMIT
    garden["interestCompleted"] = garden_complete
    if garden_complete and not garden.get("interestCompletedAt"):
        garden["interestCompletedAt"] = timestamp
    bear["completed"] = bear_complete
    rewards = []
    if garden_complete:
        rewards.append("flower-garden")
    if bear_complete:
        rewards.append("bear-statue")
    if garden_complete and bear_complete:
        rewards.extend((
            "nature-complete-emblem",
            "real-visit-missions-unlocked",
            "nature-chapter-complete",
        ))
    farm = progress["farm"]
    farm["unlocked"] = garden_complete and bear_complete
    farm["unlockedRewardIds"] = rewards
    farm["activeRewardIds"] = [item for item in farm["activeRewardIds"] if item in rewards]
    farm["bearGrowthStage"] = "locked"
    nature = progress["natureChapter"]
    nature["gardenCompleted"] = garden_complete
    nature["bearTreeCompleted"] = bear_complete
    nature["completed"] = garden_complete and bear_complete
    if nature["completed"] and not nature.get("completedAt"):
        nature["completedAt"] = timestamp
    for mission in ("garden", "bearTree"):
        record = progress["realVisit"][mission]
        if not farm["unlocked"]:
            record["status"] = "locked"
        elif record["status"] == "locked":
            record["status"] = "available"
    progress["layoutVersion"] = 1
    progress["updatedAt"] = timestamp
    return progress


def _personal_farm_db():
    db = struct.db("personal_farm_progress")
    db.orm.create_table(safe=True)
    return db


def _load_personal_farm(db, user_id):
    record = db.get(id=user_id)
    if record is None:
        return _personal_farm_default(), None
    try:
        stored = json.loads(record.get("payload") or "{}")
    except (TypeError, ValueError, json.JSONDecodeError):
        stored = {}
    return _normalize_personal_farm(stored), record


def _save_personal_farm(db, user_id, progress, record):
    now = datetime.datetime.now()
    progress = _apply_personal_farm_rules(progress, now)
    values = {
        "user_id": user_id,
        "version": 1,
        "payload": json.dumps(progress, ensure_ascii=False, separators=(",", ":")),
        "updated": now,
    }
    if record is None:
        db.insert({"id": user_id, "created": now, **values})
    else:
        db.update(values, id=user_id)
    return progress


def _personal_farm_error(status, code, message):
    return wiz.response.status(status, errorCode=code, message=message)


def personal_farm_progress():
    user_id = session.get("id")
    if not user_id:
        return _personal_farm_error(401, "UNAUTHENTICATED", "로그인이 필요합니다.")
    db = _personal_farm_db()
    progress, record = _load_personal_farm(db, user_id)
    action = wiz.request.query("action", "").strip()
    if not action:
        progress = _save_personal_farm(db, user_id, progress, record)
        return wiz.response.status(200, progress=progress)

    garden = progress["gardenMission"]
    bear = progress["bearMission"]
    if action in ("collectFlower", "plantFlower", "removeFlower"):
        flower_id = wiz.request.query("flowerId", "").strip()
        if flower_id not in PERSONAL_FARM_FLOWERS:
            return _personal_farm_error(400, "INVALID_FLOWER_ID", "지원하지 않는 꽃입니다.")
        if action == "collectFlower":
            if flower_id in garden["collectedFlowerIds"]:
                return _personal_farm_error(409, "FLOWER_ALREADY_COLLECTED", "이미 수집한 꽃입니다.")
            garden["collectedFlowerIds"].append(flower_id)
        elif action == "plantFlower":
            if flower_id not in garden["collectedFlowerIds"]:
                return _personal_farm_error(409, "FLOWER_NOT_COLLECTED", "꽃을 먼저 수집해 주세요.")
            if flower_id in garden["plantedFlowerIds"]:
                return _personal_farm_error(409, "FLOWER_ALREADY_PLANTED", "이미 심은 꽃입니다.")
            if len(garden["plantedFlowerIds"]) >= PERSONAL_FARM_FLOWER_BED_LIMIT:
                return _personal_farm_error(409, "FLOWER_BED_FULL", "화단에는 꽃을 5개까지 심을 수 있습니다.")
            garden["plantedFlowerIds"].append(flower_id)
        else:
            if flower_id not in garden["plantedFlowerIds"]:
                return _personal_farm_error(409, "FLOWER_NOT_PLANTED", "화단에 심지 않은 꽃입니다.")
            garden["plantedFlowerIds"] = [
                item for item in garden["plantedFlowerIds"] if item != flower_id
            ]
    elif action == "collectFeed":
        feed_id = wiz.request.query("feedId", "").strip()
        if feed_id not in PERSONAL_FARM_FEEDS:
            return _personal_farm_error(400, "INVALID_FEED_ID", "지원하지 않는 먹이입니다.")
        if feed_id in bear["collectedFeedIds"]:
            return _personal_farm_error(409, "FEED_ALREADY_COLLECTED", "이미 수집한 먹이입니다.")
        bear["collectedFeedIds"].append(feed_id)
    elif action == "completeFeedSpot":
        spot_id = wiz.request.query("spotId", "").strip()
        if spot_id not in PERSONAL_FARM_FEED_SPOTS:
            return _personal_farm_error(400, "INVALID_FEED_SPOT_ID", "지원하지 않는 먹이 지점입니다.")
        if spot_id in bear["completedFeedSpotIds"]:
            return _personal_farm_error(409, "FEED_SPOT_ALREADY_COMPLETED", "이미 주운 먹이입니다.")
        if len(bear["completedFeedSpotIds"]) > len(bear["fedFeedSpotIds"]):
            return _personal_farm_error(
                409, "FEED_PENDING_DELIVERY", "먼저 들고 있는 먹이를 곰에게 주세요."
            )
        feed_id = PERSONAL_FARM_FEED_BY_SPOT[spot_id]
        if feed_id not in bear["collectedFeedIds"]:
            bear["collectedFeedIds"].append(feed_id)
        bear["completedFeedSpotIds"].append(spot_id)
    elif action == "feedBear":
        if bear.get("bearFed"):
            return _personal_farm_error(
                409, "BEAR_ALREADY_FED", "이미 곰 급여 체험을 완료했습니다."
            )
        pending_spot_id = next((
            item for item in bear["completedFeedSpotIds"]
            if item not in bear["fedFeedSpotIds"]
        ), None)
        if pending_spot_id is None:
            return _personal_farm_error(
                409, "FEED_NOT_COLLECTED", "먹이를 하나 주운 뒤 곰에게 주세요."
            )
        bear["fedFeedSpotIds"].append(pending_spot_id)
        if all(item in bear["fedFeedSpotIds"] for item in PERSONAL_FARM_FEED_SPOTS):
            bear["bearFedAt"] = datetime.datetime.now().isoformat()
    elif action == "activeRewards":
        try:
            reward_ids = json.loads(wiz.request.query("rewardIds", "[]"))
        except (TypeError, ValueError, json.JSONDecodeError):
            reward_ids = None
        if not isinstance(reward_ids, list) or len(reward_ids) > 5 or any(
            item not in progress["farm"]["unlockedRewardIds"] for item in reward_ids
        ):
            return _personal_farm_error(409, "REWARD_NOT_UNLOCKED", "잠금 해제된 보상만 배치할 수 있습니다.")
        progress["farm"]["activeRewardIds"] = list(dict.fromkeys(reward_ids))
    elif action == "visitProof":
        mission = wiz.request.query("mission", "").strip()
        try:
            metadata = json.loads(wiz.request.query("metadata", "{}"))
        except (TypeError, ValueError, json.JSONDecodeError):
            metadata = None
        if mission not in ("garden", "bearTree") or not isinstance(metadata, dict) or len(metadata) > 20:
            return _personal_farm_error(400, "INVALID_VISIT_PROOF", "방문 인증 정보가 올바르지 않습니다.")
        target = progress["realVisit"][mission]
        if target["status"] == "locked":
            return _personal_farm_error(409, "VISIT_MISSION_LOCKED", "현장 방문 미션이 아직 잠겨 있습니다.")
        target.update({
            "status": "submitted",
            "submittedAt": datetime.datetime.now().isoformat(),
            "reviewedAt": None,
            "metadata": {str(key)[:40]: str(value)[:300] for key, value in metadata.items()},
        })
    else:
        return _personal_farm_error(400, "INVALID_ACTION", "지원하지 않는 마이홈 작업입니다.")

    progress = _save_personal_farm(db, user_id, progress, record)
    return wiz.response.status(200, progress=progress)


PROJECT_ROOM_STATUSES = ("recruiting", "planning", "active", "completed")
PROJECT_ROOM_SEEDS = (
    {
        "id": "garden-photo", "title": "수목원 사진 기록 프로젝트",
        "summary": "계절별 식물과 풍경을 사진으로 기록해요.",
        "description": "국립세종수목원을 함께 걸으며 대표 식물과 계절의 변화를 촬영하고 작은 온라인 도감을 완성합니다.",
        "placeIds": ["국립세종수목원"], "activityTypes": ["사진", "자연", "조사"],
        "tags": ["사진", "자연", "수목원", "기록"], "leaderId": "초록산책",
        "memberIds": ["초록산책", "하늘여우"], "applicantIds": [], "maxMembers": 5,
        "startDate": "2026-08-08", "deadline": "2026-08-05",
        "preferredTraits": ["사진 기록형", "여유형", "대화 중심"],
        "status": "recruiting", "visibility": "public", "thumbnail": "🌸",
        "createdAt": "2026-07-20T09:00:00.000Z",
    },
    {
        "id": "night-festival", "title": "세종 야간축제 탐방 프로젝트",
        "summary": "공연과 야경을 함께 탐방하고 축제 지도를 만들어요.",
        "description": "호수공원 야간축제의 공연, 먹거리, 포토존을 나누어 조사한 뒤 방문자용 추천 지도를 제작합니다.",
        "placeIds": ["세종호수공원"], "activityTypes": ["축제", "탐방", "사진"],
        "tags": ["야간축제", "공연", "사진", "호수공원"], "leaderId": "별빛여행",
        "memberIds": ["별빛여행", "밤산책"], "applicantIds": [], "maxMembers": 6,
        "startDate": "2026-08-15", "deadline": "2026-08-10",
        "preferredTraits": ["탐색형", "자유형", "실행 중심"],
        "status": "recruiting", "visibility": "public", "thumbnail": "🎆",
        "createdAt": "2026-07-22T09:00:00.000Z",
    },
    {
        "id": "market-culture", "title": "전통시장 문화 기록 프로젝트",
        "summary": "상인 인터뷰와 로컬 먹거리를 기록해요.",
        "description": "전통시장의 오래된 가게와 새로운 청년 상점을 찾아 인터뷰하고 세종의 생활문화를 카드뉴스로 남깁니다.",
        "placeIds": ["전통시장"], "activityTypes": ["문화", "인터뷰", "조사"],
        "tags": ["전통시장", "문화", "인터뷰", "먹거리"], "leaderId": "시장탐험가",
        "memberIds": ["시장탐험가", "복숭아소다", "기록자"], "applicantIds": [], "maxMembers": 5,
        "startDate": "2026-08-22", "deadline": "2026-08-16",
        "preferredTraits": ["계획형", "대화 중심", "실행 중심"],
        "status": "recruiting", "visibility": "public", "thumbnail": "🏮",
        "createdAt": "2026-07-24T09:00:00.000Z",
    },
)


def _project_room_text(value, maximum, allow_empty=False):
    if not isinstance(value, str):
        return "" if allow_empty else None
    value = value.strip()
    if (not value and not allow_empty) or len(value) > maximum:
        return None
    return value


def _project_room_list(value, maximum=30):
    if not isinstance(value, list) or len(value) > maximum:
        return None
    result = []
    for item in value:
        item = _project_room_text(item, 80)
        if item is None:
            return None
        if item not in result:
            result.append(item)
    return result


def _normalize_project_room_project(value):
    if not isinstance(value, dict):
        return None
    project_id = _project_room_text(value.get("id"), 80)
    title = _project_room_text(value.get("title"), 80)
    summary = _project_room_text(value.get("summary"), 300, allow_empty=True)
    description = _project_room_text(value.get("description"), 2000, allow_empty=True)
    leader_id = _project_room_text(value.get("leaderId") or value.get("leaderNickname"), 80)
    status = value.get("status", "recruiting")
    visibility = value.get("visibility", "public")
    try:
        max_members = int(value.get("maxMembers", 5))
    except (TypeError, ValueError):
        max_members = 0
    list_values = {
        "placeIds": value.get("placeIds", []),
        "activityTypes": value.get("activityTypes", []),
        "tags": value.get("tags", []),
        "memberIds": value.get("memberIds", value.get("memberNicknames", [])),
        "applicantIds": value.get("applicantIds", value.get("applicantNicknames", [])),
        "preferredTraits": value.get("preferredTraits", []),
    }
    lists = {key: _project_room_list(item) for key, item in list_values.items()}
    if (
        project_id is None or title is None or summary is None or description is None
        or leader_id is None or status not in PROJECT_ROOM_STATUSES
        or visibility not in ("public", "private") or not 2 <= max_members <= 100
        or any(item is None for item in lists.values())
    ):
        return None
    project = {
        "id": project_id, "title": title, "summary": summary,
        "description": description, "leaderId": leader_id,
        "maxMembers": max_members, "status": status, "visibility": visibility,
        **lists,
    }
    if leader_id not in project["memberIds"]:
        project["memberIds"].insert(0, leader_id)
    for key, maximum in (("startDate", 40), ("deadline", 40), ("thumbnail", 20), ("createdAt", 50)):
        item = _project_room_text(value.get(key, ""), maximum, allow_empty=True)
        if item:
            project[key] = item
    if "createdAt" not in project:
        project["createdAt"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    return project


def _project_room_db():
    db = struct.db("project_room_project")
    db.orm.create_table(safe=True)
    return db


def _seed_project_room(db):
    now = datetime.datetime.now()
    for seed in PROJECT_ROOM_SEEDS:
        if db.get(id=seed["id"]) is not None:
            continue
        db.insert({
            "id": seed["id"], "leader_user_id": "seed:" + seed["id"],
            "status": seed["status"], "visibility": seed["visibility"],
            "payload": json.dumps(seed, ensure_ascii=False, separators=(",", ":")),
            "created": now, "updated": now,
        })


def _project_room_projects(user_id):
    db = _project_room_db()
    _seed_project_room(db)
    payload_raw = wiz.request.query("payload", "")
    if not payload_raw:
        projects = []
        for row in db.rows(orderby="created", order="DESC", dump=100):
            if row.get("visibility") == "private" and row.get("leader_user_id") != user_id:
                continue
            try:
                project = _normalize_project_room_project(json.loads(row.get("payload") or "{}"))
            except (TypeError, ValueError, json.JSONDecodeError):
                project = None
            if project is not None:
                projects.append(project)
        return wiz.response.status(200, projects=projects)

    if not user_id:
        return wiz.response.status(401, message="로그인이 필요합니다.")
    if not isinstance(payload_raw, str) or len(payload_raw.encode("utf-8")) > 20000:
        return wiz.response.status(413, message="프로젝트 데이터가 너무 큽니다.")
    try:
        project = _normalize_project_room_project(json.loads(payload_raw))
    except (TypeError, ValueError, json.JSONDecodeError):
        project = None
    if project is None:
        return wiz.response.status(400, message="프로젝트 형식이 올바르지 않습니다.")
    current = db.get(id=project["id"])
    if current is not None and current.get("leader_user_id") != user_id:
        return wiz.response.status(403, message="다른 사용자의 프로젝트는 수정할 수 없습니다.")
    now = datetime.datetime.now()
    values = {
        "leader_user_id": user_id, "status": project["status"],
        "visibility": project["visibility"],
        "payload": json.dumps(project, ensure_ascii=False, separators=(",", ":")),
        "updated": now,
    }
    if current is None:
        db.insert({"id": project["id"], "created": now, **values})
    else:
        db.update(values, id=project["id"])
    return wiz.response.status(200, project=project)


# Map AI behavior persistence is intentionally handled by the WIZ runtime.
# The React experience still uses localStorage as an offline cache, while this
# endpoint provides the authenticated MySQL source shared across browsers.
BEHAVIOR_STATE_VERSION = 1
BEHAVIOR_STATE_MAX_BYTES = 750000
BEHAVIOR_VALUE_MAX_BYTES = 200000
BEHAVIOR_KEY_PREFIXES = (
    "sejong-",
    "greenhouse-",
    "bear-",
    "campus-",
    "government-",
    "nature-discovery-",
    "festival-",
    "food-",
    "project-room-",
    "club-street-",
    "arts-center-",
)


def _valid_behavior_key(value):
    return (
        isinstance(value, str)
        and 1 <= len(value) <= 180
        and value.startswith(BEHAVIOR_KEY_PREFIXES)
    )


def _behavior_state_db():
    db = struct.db("ai_behavior_state")
    db.orm.create_table(safe=True)
    return db


def behavior_state():
    user_id = session.get("id") or ""
    if wiz.request.query("resource", "").strip() == "projectRoomProjects":
        return _project_room_projects(user_id)

    if not user_id:
        return wiz.response.status(
            401,
            message="로그인이 필요합니다.",
        )

    db = _behavior_state_db()
    payload_raw = wiz.request.query("payload", "")

    if not payload_raw:
        record = db.get(id=user_id)
        if record is None:
            return wiz.response.status(
                200,
                version=BEHAVIOR_STATE_VERSION,
                entries={},
                updatedAt=None,
            )
        try:
            stored = json.loads(record.get("payload") or "{}")
        except (TypeError, ValueError, json.JSONDecodeError):
            stored = {}
        entries = stored.get("entries", {}) if isinstance(stored, dict) else {}
        if not isinstance(entries, dict):
            entries = {}
        entries = {
            key: value
            for key, value in entries.items()
            if _valid_behavior_key(key) and isinstance(value, str)
        }
        updated = record.get("updated")
        return wiz.response.status(
            200,
            version=BEHAVIOR_STATE_VERSION,
            entries=entries,
            updatedAt=updated.isoformat() if hasattr(updated, "isoformat") else str(updated or ""),
        )

    if not isinstance(payload_raw, str):
        return wiz.response.status(400, message="행동 데이터 형식이 올바르지 않습니다.")
    if len(payload_raw.encode("utf-8")) > BEHAVIOR_STATE_MAX_BYTES:
        return wiz.response.status(413, message="행동 데이터가 너무 큽니다.")

    try:
        payload = json.loads(payload_raw)
    except (TypeError, ValueError, json.JSONDecodeError):
        return wiz.response.status(400, message="행동 데이터를 해석하지 못했습니다.")

    entries = payload.get("entries") if isinstance(payload, dict) else None
    if not isinstance(entries, dict) or len(entries) > 200:
        return wiz.response.status(400, message="행동 데이터 형식이 올바르지 않습니다.")

    normalized = {}
    for key, value in entries.items():
        if not _valid_behavior_key(key) or not isinstance(value, str):
            return wiz.response.status(400, message="허용되지 않은 행동 데이터가 포함되어 있습니다.")
        if len(value.encode("utf-8")) > BEHAVIOR_VALUE_MAX_BYTES:
            return wiz.response.status(413, message="개별 행동 데이터가 너무 큽니다.")
        normalized[key] = value

    now = datetime.datetime.now()
    serialized = json.dumps(
        {"version": BEHAVIOR_STATE_VERSION, "entries": normalized},
        ensure_ascii=False,
        separators=(",", ":"),
    )
    current = db.get(id=user_id)
    values = {
        "user_id": user_id,
        "version": BEHAVIOR_STATE_VERSION,
        "payload": serialized,
        "updated": now,
    }
    if current is None:
        values.update({"id": user_id, "created": now})
        db.insert(values)
    else:
        db.update(values, id=user_id)

    return wiz.response.status(
        200,
        version=BEHAVIOR_STATE_VERSION,
        saved=len(normalized),
        updatedAt=now.isoformat(),
    )
