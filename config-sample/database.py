import os
import season


def mysql_config():
    """환경변수 기반 WIZ MySQL 설정을 반환한다."""
    return season.util.stdClass(
        type="mysql",
        host=os.getenv("SJ_DB_HOST", "127.0.0.1"),
        port=int(os.getenv("SJ_DB_PORT", "3306")),
        user=os.getenv("SJ_DB_USER", "jochwon_app"),
        password=os.getenv("SJ_DB_PASSWORD", ""),
        database=os.getenv("SJ_DB_NAME", "jochwon"),
        charset="utf8mb4",
    )


# src/model/db/*와 portal/post/model/db/*가 사용하는 namespace다.
# 운영에서는 두 namespace가 같은 MySQL DB를 사용한다.
base = mysql_config()
post = mysql_config()
