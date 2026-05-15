import os

from celery import Celery


def _get_redis_url() -> str:
    return os.getenv("RTMS_CELERY_BROKER_URL", os.getenv("RTMS_REDIS_URL", "redis://localhost:6379/0"))


celery_app = Celery(
    "rtms",
    broker=_get_redis_url(),
    backend=os.getenv("RTMS_CELERY_RESULT_BACKEND", _get_redis_url()),
    include=["app.tasks.device_action_tasks", "app.tasks.connector_tasks"],
)

celery_app.conf.update(
    task_track_started=True,
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="Asia/Tokyo",
    beat_schedule={
        "check-and-dispatch-connectors": {
            "task": "app.tasks.connector_tasks.check_and_dispatch_connectors",
            "schedule": 60.0,  # 毎分実行
        },
    },
)