import json
import urllib.parse
import urllib.request

session = wiz.model("portal/season/session").use()

if not session.get("id"):
    wiz.response.status(401, message="로그인이 필요합니다.")
else:
    query = wiz.request.query("query", "").strip()[:80]
    if not query:
        wiz.response.status(400, message="검색어를 입력해 주세요.")
    else:
        try:
            config = wiz.config("secret")
            api_key = str(getattr(config, "KAKAO_REST_API_KEY", "") or "").strip()
        except Exception:
            api_key = ""
        if not api_key:
            wiz.response.status(503, message="카카오 Local API 설정을 확인해 주세요.")
        else:
            params = urllib.parse.urlencode({"query": query, "x": "127.289", "y": "36.5", "radius": "20000", "size": "15"})
            request = urllib.request.Request("https://dapi.kakao.com/v2/local/search/keyword.json?" + params, headers={"Authorization": "KakaoAK " + api_key}, method="GET")
            try:
                with urllib.request.urlopen(request, timeout=10) as response:
                    result = json.loads(response.read().decode("utf-8"))
                places = []
                for item in result.get("documents", []):
                    address = str(item.get("address_name") or "")
                    road_address = str(item.get("road_address_name") or "")
                    if "세종특별자치시" not in address and "세종특별자치시" not in road_address:
                        continue
                    places.append({"id": str(item.get("id") or ""), "name": str(item.get("place_name") or ""), "category": str(item.get("category_name") or ""), "address": address, "roadAddress": road_address, "externalUrl": str(item.get("place_url") or ""), "longitude": float(item.get("x")), "latitude": float(item.get("y")), "source": "kakao"})
                wiz.response.status(200, places=places)
            except Exception:
                wiz.response.status(502, message="카카오 장소 검색에 실패했습니다.")
