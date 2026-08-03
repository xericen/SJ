import json
import re
import secrets
import urllib.error
import urllib.parse
import urllib.request

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
    provider = wiz.request.query("provider", "")
    if provider == "kakao":
        return _kakao_start()
    if provider == "demo":
        return _demo_login()
    if wiz.request.query("code", "") or wiz.request.query("state", "") or wiz.request.query("error", ""):
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


def _demo_login():
    demo_token = session.get("demo_user_token", "")
    if not isinstance(demo_token, str) or not re.match(r"^[a-f0-9]{24}$", demo_token):
        demo_token = secrets.token_hex(12)

    email = f"demo-{demo_token}@experience.local"
    nickname = "체험 탐험가"

    try:
        user = struct.user.db.get(email=email)
        if user is None:
            user_id = struct.user.create({
                "email": email,
                "password": secrets.token_urlsafe(32),
                "name": nickname,
                "role": "user",
            })
            user = struct.user.get(user_id)
        if user is None:
            raise ValueError("failed to create demo user")
    except Exception:
        return _login_redirect("error", message="체험 계정을 준비하지 못했습니다. 잠시 후 다시 시도해 주세요.")

    _set_session(user)
    session.set(demo_user_token=demo_token)
    return _login_redirect(
        "success",
        userId=str(user["id"]),
        nickname=user.get("name") or nickname,
        profileImage="",
    )


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
    if not origin:
        return ""
    return f"{origin}/wiz/api/page.home/login"


def _kakao_request_json(url, data=None, headers=None):
    request = urllib.request.Request(
        url,
        data=data,
        headers=headers or {},
        method="POST" if data is not None else "GET",
    )
    with urllib.request.urlopen(request, timeout=10) as response:
        return json.loads(response.read().decode("utf-8"))


def _login_redirect(status, **params):
    query = {"login": status}
    query.update(params)
    wiz.response.redirect("/assets/jochwon-app/index.html?" + urllib.parse.urlencode(query))


def _kakao_start():
    config = _secret_config()
    client_id = getattr(config, "KAKAO_REST_API_KEY", "") if config is not None else ""
    redirect_uri = _kakao_callback_url()

    if not client_id or not redirect_uri:
        return _login_redirect("error", message="카카오 로그인 설정을 확인해 주세요.")

    state = secrets.token_urlsafe(24)
    session.set(kakao_oauth_state=state)
    params = {
        "client_id": client_id.strip(),
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "state": state,
    }
    scopes = getattr(config, "KAKAO_LOGIN_SCOPES", "") or ""
    scopes = ",".join(scope.strip() for scope in scopes.split(",") if scope.strip())
    if scopes:
        params["scope"] = scopes
    service_terms = getattr(config, "KAKAO_SERVICE_TERMS", "") or ""
    service_terms = ",".join(term.strip() for term in service_terms.split(",") if term.strip())
    if service_terms:
        params["service_terms"] = service_terms

    authorization_url = "https://kauth.kakao.com/oauth/authorize?" + urllib.parse.urlencode(params)
    wiz.response.redirect(authorization_url)


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
    elif not code or not state or not expected_state or not secrets.compare_digest(state, expected_state):
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
                headers={"Content-Type": "application/x-www-form-urlencoded;charset=utf-8"},
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
        except (urllib.error.URLError, ValueError, KeyError, TypeError, json.JSONDecodeError):
            error_message = "카카오 로그인 처리에 실패했습니다. 잠시 후 다시 시도해 주세요."
        except Exception:
            error_message = "로그인 정보를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요."

    if error_message:
        return _login_redirect("error", message=error_message)

    _set_session(user)
    return _login_redirect(
        "success",
        userId=kakao_user_id,
        nickname=nickname,
        profileImage=profile_image,
    )
