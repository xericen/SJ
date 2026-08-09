import peewee as pw

orm = wiz.model("portal/season/orm")
base = orm.base("base")


class Model(base):
    class Meta:
        db_table = "project_room_application"

    id = pw.CharField(max_length=100, primary_key=True)
    project_id = pw.CharField(max_length=80, index=True)
    payload = pw.TextField(default="{}")
    created = pw.DateTimeField(index=True)
    updated = pw.DateTimeField(index=True)
