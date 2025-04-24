# celery_worker.py

import os
from celery import Celery
import mongo_tool
import discord_tool
import asyncio

CELERY_BROKER_URL = os.getenv("REDIS_URL")

CELERY_BROKER_URL = os.getenv("REDIS_URL")

celery_app = Celery(
    "celery_worker",
    broker=CELERY_BROKER_URL,
    backend=CELERY_BROKER_URL  # optional, if you want to use Redis for result backend too
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
        result = discord_tool.ask_and_get_reply(args["message"]["content"])
    elif tool_name == "query_profile_info":
        result = mongo_tool.query_mongo_db_for_candidate_profile()
    else:
        result = None

    mongo_tool.save_tool_message(call_id, tool_name, args, result)
    return result
