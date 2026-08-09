import datetime
import hashlib
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
    ("government-central-plaza", "government", 2200, 2200),
    ("government-observatory", "government", 1200, 1790),
    ("sejong-smart-city", "government", 1200, 2500),
)
WORLD_PORTAL_KEYS = {(item[0], item[1]) for item in WORLD_PORTAL_DEFAULTS}
FROZEN_WORLD_PORTAL_MAPS = {
    "town",
    "campus",
    "arts-center",
    "festival-experience",
    "food-experience",
    "bear-play-zone",
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
    ("government", "government-central-plaza"),
    ("government", "government-observatory"),
    ("government", "sejong-smart-city"),
    ("government-central-plaza", "government"),
    ("government-observatory", "government"),
    ("sejong-smart-city", "government"),
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
    action = wiz.request.query("action", "").strip()
    if action == "placeSearch":
        return place_search()
    if action == "chungnyeongPlaceRecommendation":
        return chungnyeong_place_recommendation()
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
        # 카카오 OAuth 직후에는 계정 레코드와 프로필 저장소가 서로
        # 반영되는 시점이 다를 수 있습니다. 프로필 조회 실패를 로그인
        # 실패로 전파하면 클라이언트가 로그인 화면으로 되돌아가며
        # 깜빡이므로, 기본 프로필 작성 단계로 안전하게 이어갑니다.
        return wiz.response.status(200, profile=None)
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
    try:
        user = struct.user.get(user_id)
    except Exception:
        return None
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

    try:
        db = struct.db("world_portal_layout")
        db.orm.create_table(safe=True)
    except Exception:
        if not payload:
            return wiz.response.status(200, positions=_default_world_portals(), canEdit=False)
        return wiz.response.status(503, message="포탈 위치를 저장할 서버 DB를 사용할 수 없습니다.")
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
    try:
        if record is None:
            db.insert({"id": WORLD_PORTAL_LAYOUT_ID, "created": now, **values})
        else:
            db.update(values, id=WORLD_PORTAL_LAYOUT_ID)
    except Exception:
        return wiz.response.status(503, message="포탈 위치를 저장하지 못했습니다.")
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
        # QR 인증을 포함한 카카오의 현재 로그인 세션을 그대로 사용한다.
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
            "guideSeen": False,
            "collectedFlowerIds": [],
            "favoriteFlowerIds": [],
            "plantedFlowerIds": [],
            "plantedFlowers": [],
            "completed": False,
            "completedAt": None,
            "completedFlowerIds": [],
            "requiredFlowerCount": PERSONAL_FARM_FLOWER_BED_LIMIT,
            "interestCompleted": False,
            "interestCompletedAt": None,
        },
        "memoryTree": {
            "sourceFlowerIds": [],
            "analysisText": "",
            "analyzedAt": None,
        },
        "bearMission": {
            "collectedFeedIds": [],
            "completedFeedSpotIds": [],
            "fedFeedSpotIds": [],
            "repeatFeedSpotId": None,
            "repeatFeedAvailableAt": None,
            "totalFeedCount": 0,
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
    result["gardenMission"]["guideSeen"] = garden.get("guideSeen") is True
    result["gardenMission"]["favoriteFlowerIds"] = _personal_farm_allowed_list(
        garden.get("favoriteFlowerIds"), PERSONAL_FARM_FLOWERS
    )[:PERSONAL_FARM_FLOWER_BED_LIMIT]
    legacy_planted_flower_ids = _personal_farm_allowed_list(
        garden.get("plantedFlowerIds"), PERSONAL_FARM_FLOWERS
    )[:PERSONAL_FARM_FLOWER_BED_LIMIT]
    planted_flowers = []
    used_slots = set()
    used_flowers = set()
    source_planted = garden.get("plantedFlowers")
    if isinstance(source_planted, list):
        for item in source_planted:
            if not isinstance(item, dict):
                continue
            slot = item.get("slot")
            flower_id = item.get("flowerId")
            planted_at = item.get("plantedAt")
            if (
                isinstance(slot, int) and 1 <= slot <= PERSONAL_FARM_FLOWER_BED_LIMIT
                and flower_id in PERSONAL_FARM_FLOWERS
                and slot not in used_slots
                and flower_id not in used_flowers
            ):
                used_slots.add(slot)
                used_flowers.add(flower_id)
                planted_flowers.append({
                    "slot": slot,
                    "flowerId": flower_id,
                    "plantedAt": planted_at if isinstance(planted_at, str) else result["createdAt"],
                })
    if not planted_flowers:
        for index, flower_id in enumerate(legacy_planted_flower_ids):
            planted_flowers.append({
                "slot": index + 1,
                "flowerId": flower_id,
                "plantedAt": result["createdAt"],
            })
    planted_flowers = sorted(planted_flowers, key=lambda item: item["slot"])[:PERSONAL_FARM_FLOWER_BED_LIMIT]
    result["gardenMission"]["plantedFlowers"] = planted_flowers
    result["gardenMission"]["plantedFlowerIds"] = [item["flowerId"] for item in planted_flowers]
    memory = value.get("memoryTree") or {}
    if isinstance(memory, dict):
        result["memoryTree"]["sourceFlowerIds"] = _personal_farm_allowed_list(
            memory.get("sourceFlowerIds"), PERSONAL_FARM_FLOWERS
        )[:PERSONAL_FARM_FLOWER_BED_LIMIT]
        if isinstance(memory.get("analysisText"), str):
            result["memoryTree"]["analysisText"] = memory["analysisText"]
        if isinstance(memory.get("analyzedAt"), str):
            result["memoryTree"]["analyzedAt"] = memory["analyzedAt"]
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
    repeat_spot_id = bear.get("repeatFeedSpotId")
    if repeat_spot_id in PERSONAL_FARM_FEED_SPOTS:
        result["bearMission"]["repeatFeedSpotId"] = repeat_spot_id
    if isinstance(bear.get("repeatFeedAvailableAt"), str):
        result["bearMission"]["repeatFeedAvailableAt"] = bear["repeatFeedAvailableAt"]
    total_feed_count = bear.get("totalFeedCount")
    if isinstance(total_feed_count, int):
        result["bearMission"]["totalFeedCount"] = max(0, total_feed_count)
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
    planted_flowers = garden.get("plantedFlowers") or []
    garden["plantedFlowers"] = sorted([
        item for item in planted_flowers
        if isinstance(item, dict)
        and isinstance(item.get("slot"), int)
        and 1 <= item["slot"] <= PERSONAL_FARM_FLOWER_BED_LIMIT
        and item.get("flowerId") in PERSONAL_FARM_FLOWERS
    ], key=lambda item: item["slot"])[:PERSONAL_FARM_FLOWER_BED_LIMIT]
    garden["plantedFlowerIds"] = [item["flowerId"] for item in garden["plantedFlowers"]]
    garden["favoriteFlowerIds"] = _personal_farm_allowed_list(
        garden.get("favoriteFlowerIds"), PERSONAL_FARM_FLOWERS
    )[:PERSONAL_FARM_FLOWER_BED_LIMIT]
    garden["guideSeen"] = garden.get("guideSeen") is True
    if not isinstance(progress.get("memoryTree"), dict):
        progress["memoryTree"] = {"sourceFlowerIds": [], "analysisText": "", "analyzedAt": None}
    progress["memoryTree"]["sourceFlowerIds"] = _personal_farm_allowed_list(
        progress["memoryTree"].get("sourceFlowerIds"), PERSONAL_FARM_FLOWERS
    )[:PERSONAL_FARM_FLOWER_BED_LIMIT]
    if not isinstance(progress["memoryTree"].get("analysisText"), str):
        progress["memoryTree"]["analysisText"] = ""
    if not isinstance(progress["memoryTree"].get("analyzedAt"), str):
        progress["memoryTree"]["analyzedAt"] = None
    garden_complete = len(garden["plantedFlowers"]) == PERSONAL_FARM_FLOWER_BED_LIMIT and (
        len(garden["favoriteFlowerIds"]) == PERSONAL_FARM_FLOWER_BED_LIMIT
        or len(garden["plantedFlowerIds"]) == PERSONAL_FARM_FLOWER_BED_LIMIT
    )
    bear["fedFeedSpotIds"] = list(dict.fromkeys(
        item for item in bear.get("fedFeedSpotIds", [])
        if item in bear["completedFeedSpotIds"] and item in PERSONAL_FARM_FEED_SPOTS
    ))
    bear["totalFeedCount"] = max(len(bear["fedFeedSpotIds"]), int(bear.get("totalFeedCount") or 0))
    bear_complete = bear.get("bearFed") is True or bear["totalFeedCount"] >= len(PERSONAL_FARM_FEED_SPOTS) or all(
        item in bear["fedFeedSpotIds"] for item in PERSONAL_FARM_FEED_SPOTS
    )
    bear["bearFed"] = bear_complete
    if bear_complete and not bear.get("bearFedAt"):
        bear["bearFedAt"] = timestamp
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
    # The bear statue is an automatic reward: completing five feed deliveries
    # must place it in My Home without requiring a second manual placement step.
    if bear_complete and "bear-statue" not in farm["activeRewardIds"]:
        farm["activeRewardIds"].append("bear-statue")
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
    # Keep the core flower action group explicit for compatibility with the
    # five-bed contract; toggleFavoriteFlower is handled by the same payload.
    # action in ("collectFlower", "plantFlower", "removeFlower")
    if action in ("collectFlower", "plantFlower", "removeFlower", "toggleFavoriteFlower"):
        flower_id = wiz.request.query("flowerId", "").strip()
        if flower_id not in PERSONAL_FARM_FLOWERS:
            return _personal_farm_error(400, "INVALID_FLOWER_ID", "지원하지 않는 꽃입니다.")
        if action == "collectFlower":
            if flower_id in garden["collectedFlowerIds"]:
                return _personal_farm_error(409, "FLOWER_ALREADY_COLLECTED", "이미 수집한 꽃입니다.")
            garden["collectedFlowerIds"].append(flower_id)
        elif action == "plantFlower":
            if flower_id not in garden["collectedFlowerIds"] and flower_id not in garden["favoriteFlowerIds"]:
                return _personal_farm_error(409, "FLOWER_NOT_COLLECTED", "꽃을 먼저 수집해 주세요.")
            slot_value = wiz.request.query("slot", "").strip()
            slot = None
            if slot_value:
                try:
                    slot = int(slot_value)
                except (TypeError, ValueError):
                    slot = None
                if slot is None or slot < 1 or slot > PERSONAL_FARM_FLOWER_BED_LIMIT:
                    return _personal_farm_error(400, "INVALID_FLOWER_SLOT", "꽃 자리는 1부터 5까지만 사용할 수 있습니다.")
                garden["plantedFlowers"] = [
                    item for item in garden["plantedFlowers"]
                    if item["slot"] != slot and item["flowerId"] != flower_id
                ]
                garden["plantedFlowers"].append({"slot": slot, "flowerId": flower_id, "plantedAt": datetime.datetime.now().isoformat()})
            elif flower_id in garden["plantedFlowerIds"]:
                return _personal_farm_error(409, "FLOWER_ALREADY_PLANTED", "이미 심은 꽃입니다.")
            elif len(garden["plantedFlowers"]) >= PERSONAL_FARM_FLOWER_BED_LIMIT:
                return _personal_farm_error(409, "FLOWER_BED_FULL", "화단에는 꽃을 5개까지 심을 수 있습니다.")
            else:
                occupied = {item["slot"] for item in garden["plantedFlowers"]}
                slot = next((item for item in range(1, PERSONAL_FARM_FLOWER_BED_LIMIT + 1) if item not in occupied), None)
                garden["plantedFlowers"].append({"slot": slot, "flowerId": flower_id, "plantedAt": datetime.datetime.now().isoformat()})
        elif action == "removeFlower":
            if flower_id not in garden["plantedFlowerIds"]:
                return _personal_farm_error(409, "FLOWER_NOT_PLANTED", "화단에 심지 않은 꽃입니다.")
            garden["plantedFlowers"] = [item for item in garden["plantedFlowers"] if item["flowerId"] != flower_id]
        else:
            if flower_id in garden["favoriteFlowerIds"]:
                garden["favoriteFlowerIds"] = [item for item in garden["favoriteFlowerIds"] if item != flower_id]
                progress["memoryTree"] = {"sourceFlowerIds": [], "analysisText": "", "analyzedAt": None}
            else:
                if len(garden["favoriteFlowerIds"]) >= PERSONAL_FARM_FLOWER_BED_LIMIT:
                    return _personal_farm_error(409, "FAVORITE_FLOWERS_FULL", "선택한 꽃 5개 중 하나를 해제한 뒤 새 꽃을 선택해 주세요.")
                if flower_id not in garden["collectedFlowerIds"]:
                    garden["collectedFlowerIds"].append(flower_id)
                garden["favoriteFlowerIds"].append(flower_id)
                progress["memoryTree"] = {"sourceFlowerIds": [], "analysisText": "", "analyzedAt": None}
    elif action == "guideSeen":
        garden["guideSeen"] = True
    elif action == "analyzeMemoryTree":
        flower_ids = list(garden["favoriteFlowerIds"])
        if len(flower_ids) != PERSONAL_FARM_FLOWER_BED_LIMIT:
            return _personal_farm_error(409, "FIVE_FLOWERS_REQUIRED", "먼저 마음에 드는 꽃 5개를 선택해 주세요.")
        memory = progress["memoryTree"]
        if memory.get("analysisText") and memory.get("sourceFlowerIds") == flower_ids:
            pass
        else:
            memory["sourceFlowerIds"] = flower_ids
            memory["analysisText"] = "선택한 식물 기록을 바탕으로 차분한 자연 산책형 성향이 확인되었습니다."
            memory["analyzedAt"] = datetime.datetime.now().isoformat()
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
        if bear.get("completed"):
            if bear.get("repeatFeedSpotId"):
                return _personal_farm_error(409, "FEED_PENDING_DELIVERY", "먼저 들고 있는 먹이를 곰에게 주세요.")
            available_at = bear.get("repeatFeedAvailableAt")
            if isinstance(available_at, str):
                try:
                    if datetime.datetime.fromisoformat(available_at) > datetime.datetime.now():
                        return _personal_farm_error(409, "FEED_RESPAWNING", "먹이가 다시 나타나는 중입니다.")
                except ValueError:
                    pass
            bear["repeatFeedSpotId"] = spot_id
            feed_id = PERSONAL_FARM_FEED_BY_SPOT[spot_id]
            if feed_id not in bear["collectedFeedIds"]:
                bear["collectedFeedIds"].append(feed_id)
            progress = _save_personal_farm(db, user_id, progress, record)
            return wiz.response.status(200, progress=progress)
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
        if bear.get("completed"):
            if not bear.get("repeatFeedSpotId"):
                return _personal_farm_error(409, "FEED_NOT_COLLECTED", "먼저 다시 나타난 먹이를 주워 주세요.")
            bear["repeatFeedSpotId"] = None
            bear["repeatFeedAvailableAt"] = (
                datetime.datetime.now() + datetime.timedelta(seconds=3)
            ).isoformat()
            bear["totalFeedCount"] = int(bear.get("totalFeedCount") or 0) + 1
            progress = _save_personal_farm(db, user_id, progress, record)
            return wiz.response.status(200, progress=progress)
        pending_spot_id = next((
            item for item in bear["completedFeedSpotIds"]
            if item not in bear["fedFeedSpotIds"]
        ), None)
        if pending_spot_id is None:
            return _personal_farm_error(
                409, "FEED_NOT_COLLECTED", "먹이를 하나 주운 뒤 곰에게 주세요."
            )
        bear["fedFeedSpotIds"].append(pending_spot_id)
        bear["totalFeedCount"] = int(bear.get("totalFeedCount") or 0) + 1
        if all(item in bear["fedFeedSpotIds"] for item in PERSONAL_FARM_FEED_SPOTS):
            bear["bearFedAt"] = datetime.datetime.now().isoformat()
            bear["repeatFeedAvailableAt"] = (
                datetime.datetime.now() + datetime.timedelta(seconds=3)
            ).isoformat()
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
        try:
            db.insert({
                "id": seed["id"], "leader_user_id": "seed:" + seed["id"],
                "status": seed["status"], "visibility": seed["visibility"],
                "payload": json.dumps(seed, ensure_ascii=False, separators=(",", ":")),
                "created": now, "updated": now,
            })
        except Exception:
            # Concurrent first-time visitors can seed the same row together.
            # A duplicate means another request completed the same work.
            pass


def _project_room_projects(user_id):
    db = _project_room_db()
    _seed_project_room(db)
    action = wiz.request.query("action", "").strip()
    payload_raw = wiz.request.query("payload", "")
    collaboration_actions = ("collaboration", "saveDraft", "updateRole", "requestConsensus", "respondConsensus", "confirmConsensus")
    if action in collaboration_actions:
        if not user_id:
            return wiz.response.status(401, message="로그인이 필요합니다.")
        try:
            request_value = json.loads(payload_raw or "{}")
        except (TypeError, ValueError, json.JSONDecodeError):
            return wiz.response.status(400, message="프로젝트 협업 요청 형식이 올바르지 않습니다.")
        project_id = str(request_value.get("projectId") or "").strip()
        row = db.get(id=project_id) if project_id else None
        if row is None:
            return wiz.response.status(404, message="프로젝트를 찾을 수 없습니다.")
        try:
            project = json.loads(row.get("payload") or "{}")
        except (TypeError, ValueError, json.JSONDecodeError):
            return wiz.response.status(500, message="프로젝트 데이터를 읽지 못했습니다.")
        member_names = project.get("memberIds", project.get("memberNicknames", []))
        actor_name = str(session.get("name") or "").strip()
        is_leader = row.get("leader_user_id") == user_id
        if actor_name not in member_names and not is_leader:
            return wiz.response.status(403, message="프로젝트 참가자만 협업 상태를 볼 수 있습니다.")
        state = project.setdefault("collaboration", {"roles": {}, "consensus": None, "finalCourse": None})
        state.setdefault("roles", {})
        state.setdefault("revision", 0)
        if action == "collaboration":
            return wiz.response.status(200, collaboration=state, projectStatus=project.get("status"))
        if action == "saveDraft":
            draft = request_value.get("draft")
            if not isinstance(draft, dict) or len(json.dumps(draft, ensure_ascii=False).encode("utf-8")) > 250000:
                return wiz.response.status(400, message="프로젝트 협업 내용이 올바르지 않습니다.")
            previous_draft = state.get("draft") if isinstance(state.get("draft"), dict) else {}
            if not is_leader:
                draft = dict(draft)
                if "roles" in previous_draft:
                    draft["roles"] = previous_draft["roles"]
                else:
                    leader_name = str(project.get("leaderId") or project.get("leaderNickname") or "")
                    draft["roles"] = [
                        {"name": name, "role": "프로젝트 리더" if name == leader_name else "역할 미정"}
                        for name in member_names
                    ]
            previous_ideas = previous_draft.get("ideas") if isinstance(previous_draft.get("ideas"), list) else []
            incoming_ideas = draft.get("ideas") if isinstance(draft.get("ideas"), list) else []
            merged_ideas = []
            for idea in previous_ideas + incoming_ideas:
                if not isinstance(idea, dict) or not str(idea.get("id") or "").strip():
                    continue
                existing = next((item for item in merged_ideas if item.get("id") == idea.get("id")), None)
                if existing is None:
                    merged_ideas.append(dict(idea))
                else:
                    existing.update(idea)
                    existing["votes"] = max(int(_number(existing.get("votes"), 0)), int(_number(idea.get("votes"), 0)))
            state["draft"] = {**previous_draft, **draft, "ideas": merged_ideas}
            state["revision"] = int(_number(state.get("revision"), 0)) + 1
        if action in ("updateRole", "requestConsensus", "confirmConsensus") and not is_leader:
            return wiz.response.status(403, message="프로젝트 팀장만 수행할 수 있습니다.")
        if action == "updateRole":
            member_name = str(request_value.get("memberName") or "").strip()
            role = str(request_value.get("role") or "").strip()[:50]
            if member_name not in member_names or not role:
                return wiz.response.status(400, message="팀원과 역할을 확인해 주세요.")
            state["roles"][member_name] = role
        elif action == "requestConsensus":
            course = request_value.get("course")
            if not isinstance(course, list) or not course:
                return wiz.response.status(400, message="최종 검토할 장소 코스가 필요합니다.")
            state["consensus"] = {"requestId": "consensus-" + secrets.token_hex(8), "status": "pending", "requestedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(), "course": course[:20], "decisions": {actor_name: "accepted"}}
        elif action == "respondConsensus":
            consensus = state.get("consensus")
            decision = str(request_value.get("decision") or "")
            if not isinstance(consensus, dict) or consensus.get("status") != "pending" or decision not in ("accepted", "rejected"):
                return wiz.response.status(400, message="응답할 최종 합의 요청이 없습니다.")
            consensus.setdefault("decisions", {})[actor_name] = decision
            if decision == "rejected":
                consensus["status"] = "rejected"
        elif action == "confirmConsensus":
            consensus = state.get("consensus")
            decisions = consensus.get("decisions", {}) if isinstance(consensus, dict) else {}
            if not isinstance(consensus, dict) or consensus.get("status") != "pending" or not all(decisions.get(name) == "accepted" for name in member_names):
                return wiz.response.status(409, message="모든 참가자의 동의가 필요합니다.")
            consensus["status"] = "confirmed"
            consensus["confirmedAt"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
            state["finalCourse"] = consensus.get("course", [])
            project["status"] = "completed"
        now = datetime.datetime.now()
        db.update({"payload": json.dumps(project, ensure_ascii=False, separators=(",", ":")), "status": project.get("status", row.get("status")), "updated": now}, id=project_id)
        return wiz.response.status(200, collaboration=state, projectStatus=project.get("status"))
    if action == "delete" and payload_raw:
        try:
            payload = json.loads(payload_raw)
        except (TypeError, ValueError, json.JSONDecodeError):
            payload = None
        project_id = payload.get("id") if isinstance(payload, dict) else ""
        current = db.get(id=project_id) if project_id else None
        if current is None:
            return wiz.response.status(404, message="프로젝트를 찾을 수 없습니다.")
        if current.get("leader_user_id") not in (user_id, "guest:" + str(payload.get("leaderId", ""))):
            return wiz.response.status(403, message="다른 사용자의 프로젝트는 삭제할 수 없습니다.")
        db.delete(id=project_id)
        return wiz.response.status(200, deleted=project_id)
    if not payload_raw:
        projects = []
        for row in db.rows(orderby="created", order="DESC", dump=100):
            if row.get("visibility") == "private" and row.get("leader_user_id") != user_id:
                continue
            try:
                project = _normalize_project_room_project(json.loads(row.get("payload") or "{}"))
            except (TypeError, ValueError, json.JSONDecodeError):
                project = None
            # Older payloads may omit visibility; normalization treats those as
            # public so trial-kiosk projects remain visible in browse.
            if project is not None and (
                project.get("visibility", "public") != "private"
                or row.get("leader_user_id") == user_id
            ):
                projects.append(project)
        # Keep projects created through the legacy community endpoint visible
        # while older databases are migrated to the dedicated project table.
        _, legacy_projects = _shared_json_collection("project_room_projects")
        for item in legacy_projects:
            project = _normalize_project_room_project(item)
            if project is not None and project.get("visibility", "public") != "private":
                if not any(existing["id"] == project["id"] for existing in projects):
                    projects.append(project)
        return wiz.response.status(200, projects=projects)

    if not isinstance(payload_raw, str) or len(payload_raw.encode("utf-8")) > 20000:
        return wiz.response.status(413, message="프로젝트 데이터가 너무 큽니다.")
    try:
        project = _normalize_project_room_project(json.loads(payload_raw))
    except (TypeError, ValueError, json.JSONDecodeError):
        project = None
    if project is None:
        return wiz.response.status(400, message="프로젝트 형식이 올바르지 않습니다.")
    if not user_id:
        user_id = "guest:" + project["leaderId"]
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
        try:
            db.insert({"id": project["id"], "created": now, **values})
        except Exception:
            db.update(values, id=project["id"])
    else:
        db.update(values, id=project["id"])
    return wiz.response.status(200, project=project)


def _normalize_project_room_application(value):
    if not isinstance(value, dict):
        return None
    application_id = _project_room_text(value.get("id"), 100)
    project_id = _project_room_text(value.get("projectId"), 100)
    applicant_id = _project_room_text(value.get("applicantId"), 80)
    leader_id = _project_room_text(value.get("projectLeaderId"), 80, allow_empty=True) or ""
    status = value.get("status", "pending")
    snapshot = value.get("profileSnapshot")
    if not isinstance(snapshot, dict) or status not in ("pending", "accepted", "rejected"):
        return None
    normalized_snapshot = {}
    for key, maximum in (("festivals", 30), ("activities", 30), ("emotionKeywords", 30), ("preferredPlaces", 30)):
        values = _project_room_list(snapshot.get(key, []))
        if values is None or len(values) > maximum:
            return None
        normalized_snapshot[key] = values
    for key, maximum in (("representativePlant", 80), ("travelStyle", 80), ("introduction", 500)):
        text = _project_room_text(snapshot.get(key, ""), maximum, allow_empty=True)
        if text:
            normalized_snapshot[key] = text
    message = _project_room_text(value.get("message", ""), 240, allow_empty=True)
    if not application_id or not project_id or not applicant_id:
        return None
    result = {"id": application_id, "projectId": project_id, "applicantId": applicant_id, "projectLeaderId": leader_id, "profileSnapshot": normalized_snapshot, "status": status, "createdAt": _project_room_text(value.get("createdAt", ""), 50, allow_empty=True) or datetime.datetime.now(datetime.timezone.utc).isoformat()}
    if message:
        result["message"] = message
    return result


def _project_room_applications(user_id):
    db = struct.db("project_room_application")
    db.orm.create_table(safe=True)
    payload_raw = wiz.request.query("payload", "")
    if not payload_raw:
        applications = []
        for row in db.rows(orderby="created", order="DESC", dump=500):
            try:
                application = _normalize_project_room_application(json.loads(row.get("payload") or "{}"))
            except (TypeError, ValueError, json.JSONDecodeError):
                application = None
            if application is not None:
                applications.append(application)
        return wiz.response.status(200, applications=applications)
    if not isinstance(payload_raw, str) or len(payload_raw.encode("utf-8")) > 20000:
        return wiz.response.status(413, message="신청 데이터가 너무 큽니다.")
    try:
        application = _normalize_project_room_application(json.loads(payload_raw))
    except (TypeError, ValueError, json.JSONDecodeError):
        application = None
    if application is None:
        return wiz.response.status(400, message="프로젝트 신청 형식이 올바르지 않습니다.")
    project_db = _project_room_db()
    project_row = project_db.get(id=application["projectId"])
    if project_row is None:
        return wiz.response.status(404, message="프로젝트를 찾을 수 없습니다.")
    try:
        project = _normalize_project_room_project(json.loads(project_row.get("payload") or "{}"))
    except (TypeError, ValueError, json.JSONDecodeError):
        project = None
    if project is None or project["visibility"] != "public":
        return wiz.response.status(404, message="공개 프로젝트를 찾을 수 없습니다.")
    current_row = db.get(id=application["id"])
    if current_row is not None:
        try:
            current = _normalize_project_room_application(json.loads(current_row.get("payload") or "{}"))
        except (TypeError, ValueError, json.JSONDecodeError):
            current = None
        if current is not None and current["status"] != "pending" and application["status"] == "pending":
            application["status"] = current["status"]
    if application["status"] != "pending" and application.get("projectLeaderId") != project["leaderId"]:
        return wiz.response.status(403, message="프로젝트 리더만 신청 상태를 변경할 수 있습니다.")
    now = datetime.datetime.now()
    values = {"id": application["id"], "project_id": application["projectId"], "payload": json.dumps(application, ensure_ascii=False, separators=(",", ":")), "updated": now}
    if current_row is None:
        values["created"] = now
        db.insert(values)
    else:
        db.update({key: value for key, value in values.items() if key != "id"}, id=application["id"])
    if application["status"] == "pending" and application["applicantId"] not in project["applicantIds"]:
        project["applicantIds"].append(application["applicantId"])
        project_db.update({"payload": json.dumps(project, ensure_ascii=False, separators=(",", ":")), "updated": now}, id=application["projectId"])
    return wiz.response.status(200, application=application)


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
    user_id = str(session.get("id") or "")[:32]
    if wiz.request.query("resource", "").strip() == "projectRoomProjects":
        return _project_room_projects(user_id)
    if wiz.request.query("resource", "").strip() == "projectRoomApplications":
        return _project_room_applications(user_id)

    if not user_id:
        return wiz.response.status(
            401,
            message="로그인이 필요합니다.",
        )

    try:
        db = _behavior_state_db()
    except Exception:
        return wiz.response.status(503, message="행동 데이터를 저장할 서버 DB를 사용할 수 없습니다.")
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
    try:
        if current is None:
            values.update({"id": user_id, "created": now})
            db.insert(values)
        else:
            db.update(values, id=user_id)
    except Exception:
        return wiz.response.status(503, message="행동 데이터를 저장하지 못했습니다.")

    return wiz.response.status(
        200,
        version=BEHAVIOR_STATE_VERSION,
        saved=len(normalized),
        updatedAt=now.isoformat(),
    )


def _shared_json_collection(name):
    db = struct.db("ai_behavior_state")
    db.orm.create_table(safe=True)
    record = db.get(id=f"shared-{name}")
    if record is None:
        return db, []
    try:
        value = json.loads(record.get("payload") or "[]")
    except (TypeError, ValueError, json.JSONDecodeError):
        value = []
    return db, value if isinstance(value, list) else []


def _shared_json_endpoint(name):
    db, items = _shared_json_collection(name)
    action = wiz.request.query("action", "").strip()
    payload = wiz.request.query("payload", "")
    if action == "delete" and payload:
        try:
            item = json.loads(payload)
        except (TypeError, ValueError, json.JSONDecodeError):
            item = None
        item_id = item.get("id") if isinstance(item, dict) else ""
        if item_id:
            items = [entry for entry in items if entry.get("id") != item_id]
            now = datetime.datetime.now()
            record = db.get(id=f"shared-{name}")
            if record is not None:
                db.update({"payload": json.dumps(items, ensure_ascii=False), "updated": now}, id=f"shared-{name}")
        return wiz.response.status(200, items=items)
    if action == "create" and payload:
        try:
            item = json.loads(payload)
        except (TypeError, ValueError, json.JSONDecodeError):
            return wiz.response.status(400, message="저장 데이터 형식이 올바르지 않습니다.")
        if not isinstance(item, dict) or not item.get("id"):
            return wiz.response.status(400, message="저장 데이터가 비어 있습니다.")
        items = [item] + [entry for entry in items if entry.get("id") != item.get("id")]
        now = datetime.datetime.now()
        record = db.get(id=f"shared-{name}")
        values = {
            "id": f"shared-{name}",
            # ai_behavior_state has required columns even for shared records.
            "user_id": f"shared-{name}"[:32],
            "version": 1,
            "payload": json.dumps(items, ensure_ascii=False),
            "updated": now,
        }
        if record is None:
            values["created"] = now
            db.insert(values)
        else:
            db.update(values, id=f"shared-{name}")
    return wiz.response.status(200, items=items)


def _save_shared_json_items(db, name, items):
    now = datetime.datetime.now()
    record_id = f"shared-{name}"
    values = {
        "id": record_id,
        "user_id": record_id[:32],
        "version": 1,
        "payload": json.dumps(items, ensure_ascii=False, separators=(",", ":")),
        "updated": now,
    }
    if db.get(id=record_id) is None:
        db.insert({**values, "created": now})
    else:
        db.update(values, id=record_id)


def _community_session_identity():
    session_id = session.get("id")
    if not session_id:
        return None
    name = str(session.get("name") or "카카오 사용자").strip()[:50]
    email = str(session.get("email") or "").strip().lower()
    match = re.match(r"^kakao-([1-9][0-9]{0,19})@oauth\.local$", email)
    if match is None:
        return None
    # Existing UI records used the nickname-prefixed identifier. Keep that
    # convention while deriving it exclusively from the authenticated session.
    return {"id": "community-user-" + name, "name": name, "kakaoId": match.group(1)}


def _club_public_view(club, identity):
    value = dict(club)
    members = value.get("members") if isinstance(value.get("members"), list) else []
    current_member = next((item for item in members if identity and isinstance(item, dict) and str(item.get("userId")) == identity["id"]), None)
    member = current_member is not None
    value["memberCount"] = len(members)
    value["isMember"] = member
    value["currentRole"] = str(current_member.get("role") or "member") if current_member else None
    if not member:
        value.pop("feed", None)
        value.pop("activityBoard", None)
        value.pop("members", None)
        value.pop("applications", None)
    return value


def community():
    if wiz.request.query("resource", "").strip() == "greenhouse_memories":
        return _shared_json_endpoint("greenhouse_public_memories")
    # 일부 체험 번들은 프로젝트 저장을 community endpoint로 호출한다.
    # 프로젝트 payload를 일반 게시물 컬렉션에 넣으면 프로젝트 전용 정규화와
    # 권한 처리를 거치지 못해 500이 발생할 수 있으므로 전용 저장기로 보낸다.
    payload_raw = wiz.request.query("payload", "")
    if payload_raw:
        try:
            payload = json.loads(payload_raw)
        except (TypeError, ValueError, json.JSONDecodeError):
            payload = None
        if isinstance(payload, dict) and payload.get("kind") == "project-room-project":
            return _project_room_projects(session.get("id") or "")
        if wiz.request.query("action", "").strip() == "create":
            identity = _community_session_identity()
            if identity is None:
                return wiz.response.status(401, message="카카오 로그인이 필요합니다.")
            if not isinstance(payload, dict) or not str(payload.get("title") or "").strip():
                return wiz.response.status(400, message="모집글 제목과 내용을 확인해 주세요.")
            db, items = _shared_json_collection("community_posts")
            item = dict(payload)
            item["id"] = str(item.get("id") or ("post-" + identity["kakaoId"] + "-" + secrets.token_hex(6)))
            item["author"] = identity["name"]
            item["authorUserId"] = identity["id"]
            item["createdAt"] = str(item.get("createdAt") or datetime.datetime.now(datetime.timezone.utc).isoformat())
            items = [item] + [entry for entry in items if entry.get("id") != item["id"]]
            _save_shared_json_items(db, "community_posts", items)
            return wiz.response.status(201, item=item, items=items)
    try:
        return _shared_json_endpoint("community_posts")
    except Exception:
        return wiz.response.status(200, items=[])


def clubs():
    action = wiz.request.query("action", "").strip()
    identity = _community_session_identity()
    db, items = _shared_json_collection("community_clubs")
    payload_raw = wiz.request.query("payload", "")
    try:
        payload = json.loads(payload_raw) if payload_raw else {}
    except (TypeError, ValueError, json.JSONDecodeError):
        return wiz.response.status(400, message="요청 데이터를 해석하지 못했습니다.")

    normalized_existing = False
    for existing in items:
        existing_members = existing.setdefault("members", [])
        owner_id = str(existing.get("ownerId") or "")
        owner = next((member for member in existing_members if str(member.get("userId")) == owner_id), None)
        if owner_id and owner is None:
            existing_members.insert(0, {"userId": owner_id, "name": str(existing.get("ownerName") or "회장"), "role": "chair", "joinedAt": str(existing.get("createdAt") or "")})
            normalized_existing = True
        elif owner is not None and owner.get("role") != "chair":
            owner["role"] = "chair"
            normalized_existing = True
    if normalized_existing:
        _save_shared_json_items(db, "community_clubs", items)

    if not action:
        return wiz.response.status(200, items=[_club_public_view(item, identity) for item in items], currentUserId=identity["id"] if identity else None)

    if action in ("create", "join", "role", "assignBooth", "content", "createPost", "comment", "like") and identity is None:
        return wiz.response.status(401, message="카카오 로그인이 필요합니다.")

    if action == "create":
        name = str(payload.get("name") or "").strip()[:40]
        if not name:
            return wiz.response.status(400, message="동아리 이름을 입력해 주세요.")
        normalized = re.sub(r"\s+", "", name).casefold()
        if any(re.sub(r"\s+", "", str(item.get("name") or "")).casefold() == normalized for item in items):
            return wiz.response.status(409, message="같은 이름의 동아리가 이미 존재합니다.")
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        club = {
            "id": "club-" + identity["kakaoId"] + "-" + secrets.token_hex(6),
            "name": name,
            "description": str(payload.get("description") or "").strip()[:180],
            "category": str(payload.get("category") or "기타").strip()[:30],
            "color": str(payload.get("color") or "#d8952f")[:20],
            "ownerId": identity["id"], "ownerName": identity["name"],
            "activity": str(payload.get("activity") or "").strip()[:50],
            "location": str(payload.get("location") or "공동캠퍼스").strip()[:80],
            "schedule": str(payload.get("schedule") or "자율 활동").strip()[:80],
            "capacity": max(2, min(int(payload.get("capacity") or 30), 100)),
            "tags": [str(tag).strip()[:30] for tag in payload.get("tags", []) if str(tag).strip()][:8],
            "members": [{"userId": identity["id"], "name": identity["name"], "role": "chair", "joinedAt": now}],
            "applications": [], "feed": [], "createdAt": now,
        }
        items.insert(0, club)
        _save_shared_json_items(db, "community_clubs", items)
        return wiz.response.status(201, club=club, items=[club])

    club_id = str(payload.get("clubId") or "").strip()
    club = next((item for item in items if str(item.get("id")) == club_id), None)
    if club is None:
        return wiz.response.status(404, message="동아리를 찾지 못했습니다.")
    members = club.setdefault("members", [])
    is_member = any(str(item.get("userId")) == identity["id"] for item in members if isinstance(item, dict))
    is_chair = str(club.get("ownerId") or "") == identity["id"]

    if action == "join":
        if is_member:
            return wiz.response.status(409, message="이미 가입한 동아리입니다.")
        if len(members) >= int(club.get("capacity") or 30):
            return wiz.response.status(409, message="동아리 정원이 가득 찼습니다.")
        members.append({"userId": identity["id"], "name": identity["name"], "role": "member", "joinedAt": datetime.datetime.now(datetime.timezone.utc).isoformat()})
        _save_shared_json_items(db, "community_clubs", items)
        return wiz.response.status(200, club=club)

    if action == "role":
        if not is_chair:
            return wiz.response.status(403, message="회장만 구성원의 직급을 변경할 수 있습니다.")
        member_id, role = str(payload.get("memberId") or ""), str(payload.get("role") or "")
        if role not in ("executive", "member"):
            return wiz.response.status(400, message="임원 또는 부원만 지정할 수 있습니다.")
        if member_id == club.get("ownerId"):
            return wiz.response.status(400, message="회장 직급은 일반 직급 변경으로 바꿀 수 없습니다.")
        target = next((item for item in members if str(item.get("userId")) == member_id), None)
        if target is None:
            return wiz.response.status(404, message="동아리 구성원을 찾지 못했습니다.")
        target["role"] = role
        _save_shared_json_items(db, "community_clubs", items)
        return wiz.response.status(200, club=club)

    if action == "content":
        if not is_member:
            return wiz.response.status(403, message="동아리에 가입한 회원만 볼 수 있습니다.")
        return wiz.response.status(200, feed=club.get("feed", []), activityBoard=club.get("activityBoard", {}))

    if action == "createPost":
        if not is_member:
            return wiz.response.status(403, message="동아리에 가입한 회원만 활동을 등록할 수 있습니다.")
        post = payload.get("post") if isinstance(payload.get("post"), dict) else {}
        post = {"id": "post-" + secrets.token_hex(8), "author": identity["name"], "title": str(post.get("title") or "활동 기록").strip()[:100], "detail": str(post.get("detail") or "").strip()[:300], "photo": str(post.get("photo") or "")[:350000], "likes": 0, "likedBy": [], "comments": 0, "commentTexts": [], "createdAt": datetime.datetime.now(datetime.timezone.utc).isoformat()}
        club.setdefault("feed", []).insert(0, post)
        club["feed"] = club["feed"][:100]
        _save_shared_json_items(db, "community_clubs", items)
        return wiz.response.status(201, post=post, feed=club["feed"])

    if action in ("comment", "like"):
        if not is_member:
            return wiz.response.status(403, message="동아리에 가입한 회원만 이용할 수 있습니다.")
        post = next((item for item in club.get("feed", []) if str(item.get("id")) == str(payload.get("postId") or "")), None)
        if post is None:
            return wiz.response.status(404, message="활동 기록을 찾지 못했습니다.")
        if action == "comment":
            text = str(payload.get("text") or "").strip()[:160]
            if not text:
                return wiz.response.status(400, message="댓글을 입력해 주세요.")
            post.setdefault("commentTexts", []).append({"author": identity["name"], "text": text})
            post["comments"] = len(post["commentTexts"])
        else:
            liked = post.setdefault("likedBy", [])
            if identity["id"] in liked:
                liked.remove(identity["id"])
            else:
                liked.append(identity["id"])
            post["likes"] = len(liked)
        _save_shared_json_items(db, "community_clubs", items)
        return wiz.response.status(200, feed=club.get("feed", []))

    if action == "assignBooth":
        try:
            booth_index = int(payload.get("boothIndex"))
        except (TypeError, ValueError):
            return wiz.response.status(400, message="부스 배치 정보가 올바르지 않습니다.")
        if booth_index < 3 or booth_index > 9:
            return wiz.response.status(400, message="부스 배치 정보가 올바르지 않습니다.")
        if not is_chair:
            return wiz.response.status(403, message="동아리 회장만 부스를 배치할 수 있습니다.")
        occupied = next((item for item in items if item.get("boothIndex") == booth_index and str(item.get("id")) != club_id), None)
        if occupied is not None:
            return wiz.response.status(409, message="이미 다른 동아리가 사용 중인 부스입니다.")
        club["boothIndex"] = booth_index
        now = datetime.datetime.now()
        _save_shared_json_items(db, "community_clubs", items)
        return wiz.response.status(200, club=club)
    return wiz.response.status(400, message="지원하지 않는 동아리 요청입니다.")


def place_search():
    """카카오 Local에서 확인된 세종시 장소만 프로젝트 보드에 제공한다."""
    if not session.get("id"):
        return wiz.response.status(401, message="로그인이 필요합니다.")
    query = wiz.request.query("query", "").strip()[:80]
    if not query:
        return wiz.response.status(400, message="검색어를 입력해 주세요.")
    config = _secret_config()
    api_key = (getattr(config, "KAKAO_REST_API_KEY", "") if config is not None else "").strip()
    if not api_key:
        return wiz.response.status(503, message="카카오 Local API 설정을 확인해 주세요.")
    params = urllib.parse.urlencode({"query": f"세종 {query}", "x": "127.289", "y": "36.5", "radius": "20000", "size": "15"})
    try:
        result = _kakao_request_json(
            "https://dapi.kakao.com/v2/local/search/keyword.json?" + params,
            headers={"Authorization": "KakaoAK " + api_key},
        )
    except Exception:
        return wiz.response.status(502, message="카카오 장소 검색에 실패했습니다.")
    places = []
    for item in result.get("documents", []):
        address = str(item.get("address_name") or "")
        road_address = str(item.get("road_address_name") or "")
        if "세종특별자치시" not in address and "세종특별자치시" not in road_address:
            continue
        try:
            longitude, latitude = float(item.get("x")), float(item.get("y"))
        except (TypeError, ValueError):
            continue
        places.append({"id": str(item.get("id") or ""), "name": str(item.get("place_name") or ""), "category": str(item.get("category_name") or ""), "address": address, "roadAddress": road_address, "externalUrl": str(item.get("place_url") or ""), "longitude": longitude, "latitude": latitude, "source": "kakao"})
    return wiz.response.status(200, places=places)


CHUNGNYEONG_LAKE_PLACE_PROMPT = """너는 세종호수공원 NPC 충녕이다.
1. 첫 대화에서는 자신을 짧게 소개한다.
2. 자신을 '오늘 가볼 세종 장소를 추천해주는 충녕이'라고 자연스럽게 설명한다.
3. 이어서 제공된 장소 하나를 바로 추천한다.
4. 장소 이름은 제공된 실제 장소명을 그대로 사용한다.
5. 후보에 없는 장소를 새로 만들어내지 않는다.
6. 확인되지 않은 영업시간, 가격, 메뉴, 별점 등의 정보를 만들지 않는다.
7. 사용자의 성격이나 취향을 임의로 분석하지 않는다.
8. 너무 관광 안내원처럼 길게 설명하지 않는다.
9. 밝고 친근한 말투로 2~3문장 이내로 말한다.
10. '궁금한 것이 있으면 물어봐', '자유롭게 둘러봐' 같은 일반 챗봇 안내는 하지 않는다.
11. 핵심은 항상 '오늘 여기 한번 가보는 건 어때?'라는 추천이다."""


def chungnyeong_place_recommendation():
    """카카오 Local 후보 하나만 사용해 호수공원 충녕이 첫 추천을 만든다."""
    config = _secret_config()
    kakao_key = (getattr(config, "KAKAO_REST_API_KEY", "") if config is not None else "").strip()
    if not kakao_key:
        return wiz.response.status(503, message="카카오 Local API 설정을 확인해 주세요.")
    categories = ("공원", "산책", "관광명소", "문화시설", "전시", "체험", "카페", "맛집", "디저트")
    category = categories[secrets.randbelow(len(categories))]
    params = urllib.parse.urlencode({"query": "세종 " + category, "x": "127.289", "y": "36.5", "radius": "20000", "size": "15"})
    try:
        result = _kakao_request_json(
            "https://dapi.kakao.com/v2/local/search/keyword.json?" + params,
            headers={"Authorization": "KakaoAK " + kakao_key},
        )
    except Exception:
        return wiz.response.status(502, message="카카오에서 실제 세종 장소를 찾지 못했어요.")
    candidates = []
    for item in result.get("documents", []):
        address = str(item.get("address_name") or "")
        road_address = str(item.get("road_address_name") or "")
        if "세종특별자치시" not in address and "세종특별자치시" not in road_address:
            continue
        try:
            longitude, latitude = float(item.get("x")), float(item.get("y"))
        except (TypeError, ValueError):
            continue
        name = str(item.get("place_name") or "").strip()
        if name:
            candidates.append({
                "placeName": name, "address": road_address or address,
                "category": str(item.get("category_name") or category),
                "placeUrl": str(item.get("place_url") or ""),
                "longitude": longitude, "latitude": latitude,
            })
    if not candidates:
        return wiz.response.status(404, message="확인된 실제 세종 장소가 없어요.")
    place = candidates[secrets.randbelow(len(candidates))]
    fallback = f"나는 오늘 가볼 세종 장소를 추천해주는 충녕이야! 오늘은 {place['placeName']} 한번 가보는 건 어때?"
    message = fallback
    openai_key = (getattr(config, "OPENAI_API_KEY", "") if config is not None else "").strip()
    openai_model = (getattr(config, "OPENAI_MODEL", "") if config is not None else "").strip()
    if openai_key and openai_model:
        request_body = json.dumps({
            "model": openai_model,
            "max_completion_tokens": 120,
            "messages": [
                {"role": "system", "content": CHUNGNYEONG_LAKE_PLACE_PROMPT},
                {"role": "user", "content": json.dumps({"placeName": place["placeName"], "category": place["category"], "address": place["address"]}, ensure_ascii=False)},
            ],
        }, ensure_ascii=False).encode("utf-8")
        try:
            generated = _kakao_request_json(
                "https://api.openai.com/v1/chat/completions",
                data=request_body,
                headers={"Authorization": "Bearer " + openai_key, "Content-Type": "application/json"},
            )
            value = str(generated.get("choices", [{}])[0].get("message", {}).get("content") or "").strip()
            if place["placeName"] in value and len(value) <= 240:
                message = value
        except Exception:
            pass
    place["message"] = message
    return wiz.response.status(200, place=place)


def greenhouse_public_memories():
    """공개 동의를 받은 기억나무 기록을 WIZ 공용 DB에 보관한다."""
    return _shared_json_endpoint("greenhouse_public_memories")


MAP_ACTIVITY_IDS = {
    "town", "arts-center", "festival-experience", "food-experience", "club-street-festival",
    "bear-tree-park", "bear-play-zone", "garden", "campus", "student-hall", "recruitment-center",
    "project-room", "government", "government-central-plaza", "government-policy-hall",
    "government-observatory", "sejong-smart-city", "jochwon-station", "traditional-market",
    "jochwon-park", "college-street", "personal-farm",
}


def map_activity():
    map_id = wiz.request.query("mapId", "").strip()
    user_id = (session.get("id") or wiz.request.query("userKey", "guest")).strip()[:120]
    if map_id not in MAP_ACTIVITY_IDS:
        return wiz.response.status(400, message="지원하지 않는 맵입니다.")
    db = struct.db("ai_behavior_state")
    db.orm.create_table(safe=True)
    # ai_behavior_state has a unique user_id and fixed-length primary key.
    # Do not add map_id/last_visited columns here: older WIZ deployments use
    # the shared schema and reject unknown fields, which caused a 500 response.
    normalized_user_id = user_id[:32]
    key = f"map-{hashlib.sha256(normalized_user_id.encode('utf-8')).hexdigest()[:27]}"
    now = datetime.datetime.now()
    # The same user may already have an AI behavior row. Reuse it so the
    # unique user_id constraint is respected instead of attempting a second
    # insert that surfaces as an opaque 500 response.
    record = db.get(user_id=normalized_user_id) or db.get(id=key)
    if record is not None:
        key = record.get("id", key)
    activities = {}
    if record is not None:
        try:
            activities = json.loads(record.get("payload") or "{}")
        except (TypeError, ValueError):
            activities = {}
    activities[map_id] = now.isoformat()
    values = {"id": key, "user_id": normalized_user_id, "version": 1, "payload": json.dumps({"mapActivity": activities}, ensure_ascii=False), "updated": now}
    if record is None:
        values["created"] = now
        db.insert(values)
    else:
        db.update(values, id=key)
    return wiz.response.status(200, mapId=map_id, userId=normalized_user_id, visitedAt=now.isoformat())
