import peewee as pw

orm = wiz.model("portal/season/orm")
base = orm.base("base")


class Model(base):
    class Meta:
        db_table = "realtime_direct_rooms"

    id = pw.CharField(max_length=80, primary_key=True)
    member_a = pw.CharField(max_length=32, index=True)
    member_b = pw.CharField(max_length=32, index=True)
    active = pw.BooleanField(default=True, index=True)
    accepted_at = pw.DateTimeField(index=True)
    created = pw.DateTimeField(index=True)
    updated = pw.DateTimeField(index=True)
