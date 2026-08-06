import peewee as pw

orm = wiz.model("portal/season/orm")
base = orm.base("base")


class Model(base):
    class Meta:
        db_table = "realtime_direct_messages"

    id = pw.CharField(max_length=80, primary_key=True)
    room_id = pw.CharField(max_length=80, index=True)
    sender_user_id = pw.CharField(max_length=32, index=True)
    message = pw.TextField()
    sent_at = pw.DateTimeField(index=True)
    created = pw.DateTimeField(index=True)
