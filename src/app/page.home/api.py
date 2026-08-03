import json
import re

session = wiz.model("portal/season/session").use()
struct = wiz.model("struct")

EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
AVATAR_ID_PATTERN = re.compile(r"^[a-z0-9-]{1,64}$")
AVATAR_COLOR_PATTERN = re.compile(r"^#[0-9a-fA-F]{6}$")
AVATAR_TEXT_FIELDS = ("faceId", "hairStyleId", "topId", "bottomId", "shoesId")
AVATAR_COLOR_FIELDS = ("hairColor", "skinColor", "topColor", "bottomColor", "shoesColor")


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
