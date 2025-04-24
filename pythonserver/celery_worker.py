from celery import Celery
import os
import mongo_tool
import discord_tool

CELERY_BROKER_URL = os.environ.get("CELERY_BROKER_URL", "redis://localhost:6379/0")
CELERY_RESULT_BACKEND = os.environ.get("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")

celery_app = Celery(
    "celery_worker",
    broker=CELERY_BROKER_URL,
    backend=CELERY_RESULT_BACKEND
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
)

@celery_app.task
def tool_call_fn(tool_name, call_id, args):
    if tool_name == "talk_to_samarth_discord":
        import asyncio
        result = discord_tool.ask_and_get_reply(args["message"]["content"])
    elif tool_name == "query_profile_info":
        result = mongo_tool.query_mongo_db_for_candidate_profile()
    else:
        result = None
    mongo_tool.save_tool_message(call_id, tool_name, args, result)
    return result
