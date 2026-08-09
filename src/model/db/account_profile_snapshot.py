import peewee as pw

orm = wiz.model("portal/season/orm")
base = orm.base("base")


class Model(base):
    """계정 프로필 원본. 아바타 커스터마이징 데이터와 분리한다."""

    class Meta:
        db_table = "account_profile_snapshot"

    id = pw.CharField(max_length=32, primary_key=True)
    user_id = pw.CharField(max_length=32, unique=True, index=True)
    payload = pw.TextField(default="{}")
    created = pw.DateTimeField(index=True)
    updated = pw.DateTimeField(index=True)
