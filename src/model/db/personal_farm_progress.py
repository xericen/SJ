import peewee as pw

orm = wiz.model("portal/season/orm")
base = orm.base("base")


class Model(base):
    class Meta:
        db_table = "personal_farm_progress"

    id = pw.CharField(max_length=32, primary_key=True)
    user_id = pw.CharField(max_length=32, unique=True, index=True)
    version = pw.IntegerField(default=1)
    payload = pw.TextField(default="{}")
    created = pw.DateTimeField(index=True)
    updated = pw.DateTimeField(index=True)
