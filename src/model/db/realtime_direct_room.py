import peewee as pw

orm = wiz.model("portal/season/orm")
base = orm.base("base")

class Model(base):
    class Meta:
        db_table = "realtime_direct_room"
    id = pw.CharField(max_length=80, primary_key=True)
    member_a = pw.CharField(max_length=80, index=True)
    member_b = pw.CharField(max_length=80, index=True)
    active = pw.BooleanField(default=True, index=True)
    accepted_at = pw.BigIntegerField(default=0)
    created_at = pw.BigIntegerField(default=0)
    updated_at = pw.BigIntegerField(default=0, index=True)
