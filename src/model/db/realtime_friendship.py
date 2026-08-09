import peewee as pw

orm = wiz.model("portal/season/orm")
base = orm.base("base")

class Model(base):
    class Meta:
        db_table = "realtime_friendship"
    id = pw.CharField(max_length=170, primary_key=True)
    user_a = pw.CharField(max_length=80, index=True)
    user_b = pw.CharField(max_length=80, index=True)
    accepted_at = pw.BigIntegerField(default=0)
