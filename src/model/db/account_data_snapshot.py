import peewee as pw

orm = wiz.model("portal/season/orm")
base = orm.base("base")


class Model(base):
    """카카오 계정별 브라우저 체험 데이터의 서버 원본."""

    class Meta:
        db_table = "account_data_snapshot"

    id = pw.CharField(max_length=32, primary_key=True)
    user_id = pw.CharField(max_length=32, unique=True, index=True)
    version = pw.IntegerField(default=1)
    payload = pw.TextField(default="{}")
    created = pw.DateTimeField(index=True)
    updated = pw.DateTimeField(index=True)
