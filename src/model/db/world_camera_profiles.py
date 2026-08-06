import peewee as pw

orm = wiz.model("portal/season/orm")
base = orm.base("base")


class Model(base):
    class Meta:
        db_table = "world_camera_profiles"

    id = pw.CharField(max_length=40, primary_key=True)
    payload = pw.TextField(default="[]")
    updated_by = pw.CharField(max_length=32, default="")
    created = pw.DateTimeField(index=True)
    updated = pw.DateTimeField(index=True)
