import os
import re
import secrets
import urllib.parse

config = wiz.model("portal/season/config")
BASEURI = config.auth_baseuri
LOGOUT_URI = config.auth_logout_uri
LOGIN_URL = config.auth_login_uri


def _serve_app_asset(relative_path):
    relative_path = str(
        relative_path or ""
    ).replace("\\", "/").lstrip("/")
    asset_root = wiz.project.fs(
        "bundle",
        "src",
        "assets",
        "jochwon-app",
    ).abspath()
    asset_path = os.path.abspath(
        os.path.join(
            asset_root,
            relative_path,
        )
    )

    try:
        inside_asset_root = (
            os.path.commonpath([
                asset_root,
                asset_path,
            ]) == asset_root
        )
    except ValueError:
        inside_asset_root = False

    if (
        not relative_path
        or not inside_asset_root
        or not os.path.isfile(asset_path)
    ):
        wiz.response.abort(404)

    wiz.response.headers.set(**{
        "Access-Control-Allow-Origin": "*",
        "Cross-Origin-Resource-Policy":
            "cross-origin",
        "Cache-Control":
            "public, max-age=31536000, immutable",
    })
    wiz.response.download(
        asset_path,
        as_attachment=False,
    )


def _secret_config():
    try:
        return wiz.config("secret")
    except Exception:
        return None


def _public_origin():
    flask = wiz.server.package.flask
    request = flask.request
    scheme = request.headers.get("X-Forwarded-Proto", request.scheme).split(",", 1)[0].strip()
    host = request.headers.get("X-Forwarded-Host", request.host).split(",", 1)[0].strip()
    if scheme not in ("http", "https") or not re.match(r"^[A-Za-z0-9.:-]+$", host):
        return ""
    return f"{scheme}://{host}"


def _callback_url():
    origin = _public_origin()
    return f"{origin}/wiz/api/page.home/login" if origin else ""


def _client_redirect(status, **params):
    query = {"login": status}
    query.update(params)
    wiz.response.redirect(
        "/assets/jochwon-app/index.html?" + urllib.parse.urlencode(query)
    )


def _kakao_start():
    secret_config = _secret_config()
    client_id = (
        getattr(secret_config, "KAKAO_REST_API_KEY", "")
        if secret_config is not None
        else ""
    )
    redirect_uri = _callback_url()

    if not client_id or not redirect_uri:
        return _client_redirect(
            "error",
            message="카카오 로그인 설정을 확인해 주세요.",
        )

    state = secrets.token_urlsafe(24)
    wiz.session.set(kakao_oauth_state=state)
    params = {
        "client_id": client_id.strip(),
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "state": state,
        # Always show Kakao account authentication even when a provider
        # session from an earlier visit is still active.
        "prompt": "login",
    }

    scopes = getattr(secret_config, "KAKAO_LOGIN_SCOPES", "") or ""
    scopes = ",".join(scope.strip() for scope in scopes.split(",") if scope.strip())
    if scopes:
        params["scope"] = scopes

    service_terms = getattr(secret_config, "KAKAO_SERVICE_TERMS", "") or ""
    service_terms = ",".join(
        term.strip() for term in service_terms.split(",") if term.strip()
    )
    if service_terms:
        params["service_terms"] = service_terms

    authorization_url = (
        "https://kauth.kakao.com/oauth/authorize?"
        + urllib.parse.urlencode(params)
    )
    wiz.response.redirect(authorization_url)


def _demo_login():
    demo_token = wiz.session.get("demo_user_token", "")
    if not isinstance(demo_token, str) or not re.match(r"^[a-f0-9]{24}$", demo_token):
        demo_token = secrets.token_hex(12)

    email = f"demo-{demo_token}@experience.local"
    nickname = "체험 탐험가"
    user = None
    error_message = ""

    try:
        struct = wiz.model("struct")
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
        user.pop("password", None)
    except Exception:
        error_message = (
            "체험 계정을 준비하지 못했습니다. "
            "잠시 후 다시 시도해 주세요."
        )

    if error_message:
        return _client_redirect("error", message=error_message)

    wiz.session.set(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        role=user["role"],
        demo_user_token=demo_token,
    )
    return _client_redirect(
        "success",
        userId=str(user["id"]),
        nickname=user.get("name") or nickname,
        profileImage="",
    )


app_asset = wiz.request.match(
    f"{BASEURI}/jochwon-assets/<path:path>"
)
if app_asset is not None:
    _serve_app_asset(app_asset.path)


if wiz.request.match(f"{BASEURI}/check") is not None:
    status = False if wiz.session.user_id() is None else True
    data = wiz.session.get()
    wiz.response.status(200, status=status, session=data)

if wiz.request.match(f"{BASEURI}/kakao") is not None:
    _kakao_start()

if wiz.request.match(f"{BASEURI}/demo") is not None:
    _demo_login()

if wiz.request.match(f"{BASEURI}/logout") is not None:
    returnTo = wiz.request.query("returnTo", "/")
    wiz.session.set(returnTo=returnTo)

    if LOGOUT_URI is not None and LOGOUT_URI != f"{BASEURI}/logout":
        wiz.response.redirect(LOGOUT_URI)

    wiz.session.clear()
    wiz.response.redirect(returnTo)

if wiz.request.match(f"{BASEURI}/login") is not None:
    if LOGIN_URL is not None and LOGIN_URL != f"{BASEURI}/login":
        wiz.response.redirect(LOGIN_URL)

if config.auth_saml_use:
    wiz.model("portal/season/auth/saml").proceed()

wiz.response.redirect("/")
