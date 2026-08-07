import peewee as pw

orm = wiz.model("portal/season/orm")
base = orm.base("base")


class Model(base):
    class Meta:
        db_table = "project_room_project"

    id = pw.CharField(max_length=80, primary_key=True)
    leader_user_id = pw.CharField(max_length=80, index=True, default="")
    status = pw.CharField(max_length=20, index=True, default="recruiting")
    visibility = pw.CharField(max_length=20, index=True, default="public")
    payload = pw.TextField(default="{}")
    created = pw.DateTimeField(index=True)
    updated = pw.DateTimeField(index=True)
