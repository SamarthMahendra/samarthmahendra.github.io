import os
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from celery import Celery
from dotenv import load_dotenv
from openai import OpenAI, api_key


load_dotenv()
app = FastAPI()
celery = Celery(__name__, broker=os.getenv("REDIS_URL"))  # Reads REDIS_URL from env

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or restrict to your frontend domain(s)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


import discord_tool
import asyncio
import mongo_tool
import json

model_name = "gpt-4.1"

def talk_to_manager_discord(message, wait_user_id=None, timeout=60):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        reply = loop.run_until_complete(discord_tool.ask_and_get_reply(message, wait_user_id=wait_user_id, timeout=timeout))
        if reply:
            return reply
        else:
            return "No reply received from Discord manager in time."
    except Exception as e:
        return f"Failed to send message to Discord or receive reply: {e}"
    finally:
        loop.close()


# get api key from environment variable
api_key = os.getenv("OPENAI_API_KEY")

client = OpenAI(api_key=api_key)

mongo_query_tool_schema = {
"type": "function",
  "name": "query_profile_info",
  "description": "Function to query profile information, requiring no input parameters",
  "strict": True,
  "parameters": {
    "type": "object",
    "properties": {},
    "additionalProperties": False
  }
}
discord_tool_schema = {
    "type": "function",
    "name": "talk_to_samarth_discord",
    "description": "Send a message to samarth via Discord bot integration.",
    "parameters": {
        "type": "object",
        "required": ["action", "message"],
        "properties": {
            "action": {
                "type": "string",
                "description": "The action to perform, either 'send' or 'receive'"
            },
            "message": {
                "type": "object",
                "properties": {
                    "content": {"type": "string", "description": "The content of the message"},
                },
                "required": ["content"],
                "additionalProperties": False
            }
        },
        "additionalProperties": False
    },
    "strict": True
}


@app.post("/talk_to_samarth_discord")
async def talk_to_samarth_discord_api(request: Request):
    data = await request.json()
    message = data.get("message")
    result = talk_to_manager_discord(message)
    return {"result": result}

@app.post("/mongo_query")
async def mongo_query_api():
    result = mongo_tool.query_mongo_db_for_candidate_profile()
    return {"result": result}



@app.get("/health")
async def health():
    return {"status": "OK"}


from celery import shared_task
from celery_worker import celery_app


@app.get("/")
async def root():
    return {"status": "ok", "message": "FastAPI server is running"}

@celery_app.task
def tool_call_fn(tool_name, call_id, args):
    if tool_name == "talk_to_samarth_discord":
        result = discord_tool.ask_and_get_reply(args["message"]["content"])
    elif tool_name == "query_profile_info":
        result = mongo_tool.query_mongo_db_for_candidate_profile()
    else:
        result = None
    # Save the result in MongoDB
    mongo_tool.save_tool_message(call_id, tool_name, args, result, status="completed")
    return result


@app.post("/chat")
async def chat(request: Request):





    data = await request.json()
    message = data.get("message")

    conversation = data.get("conversation", [])
    if not conversation:
        print("New conversation started")
        conversation = [
            {
                "role": "system",
                "content": [{"type": "input_text", "text": "You are an AI assistant."}]
            },
            {
                "role": "user",
                "content": [{"type": "input_text", "text": message}]
            }
        ]
    else:
        if message:
            print("Continuing conversation")
            conversation.append({
                "role": "user",
                "content": [{"type": "input_text", "text": message}]
            })

    last_was_tool_call = data.get("last_was_tool_call", False)
    tool_calls = data.get("tool_calls", None)

    print(conversation)
    if last_was_tool_call and tool_calls:
        tool_outputs = []
        # fetch the last tool call and append it to the conversation
        message_id = data.get("message_id")
        print(" Pooling for tool call with message id", message_id)
        tool_calls = data.get("tool_calls")
        print("After receiving tool calls", tool_calls)

        # tool_calls is already a list from the frontend; do not eval
        conversation += [tc for tc in tool_calls]
        result  = mongo_tool.get_tool_message_status(message_id)
        if result is None or result ==-1:
            return JSONResponse({
                "status": "pending",
            })
        if not isinstance(result, str):
            import json as _json
            output_str = _json.dumps(result, ensure_ascii=False)
        else:
            output_str = result
        tool_outputs.append({
            "type": "function_call_output",
            "call_id": message_id,
            "output": output_str
        })
        conversation += tool_outputs
        # Clean conversation: remove any objects with function/method values
        import types
        def is_serializable(item):
            if isinstance(item, dict):
                for v in item.values():
                    if isinstance(v, (types.FunctionType, types.BuiltinFunctionType, types.MethodType)):
                        return False
                return True
            return not isinstance(item, (types.FunctionType, types.BuiltinFunctionType, types.MethodType))
        conversation = [item for item in conversation if is_serializable(item)]

        response2 = client.responses.create(
            model=model_name,
            input=conversation,
            text={"format": {"type": "text"}},
            reasoning={},
            tools=[mongo_query_tool_schema, discord_tool_schema],
            temperature=1,
            max_output_tokens=2048,
            top_p=1,
            store=True
        )

        # Remove non-serializable objects from conversation before returning
        def serializable_convo(convo):
            serializable = []
            for item in convo:
                if isinstance(item, dict):
                    serializable.append(item)
                elif hasattr(item, '__dict__'):
                    serializable.append(item.__dict__)
                elif isinstance(item, str):
                    serializable.append(item)
                # else: skip non-serializable objects
            return serializable
        print("conversation after tool call response and before sending to frontend", conversation)
        print(response2.output_text)
        return JSONResponse({
            "output": response2.output_text,
            "conversation": serializable_convo(conversation),
            "status": "completed",
        })



    print("conversation from frontend", conversation)
    response = client.responses.create(
        model=model_name,
        input=conversation,
        text={"format": {"type": "text"}},
        reasoning={},
        tools=[mongo_query_tool_schema, discord_tool_schema],
        temperature=1,
        max_output_tokens=2048,
        top_p=1,
        store=True
    )
    tool_outputs = []
    tool_calls = [tc for tc in response.output if getattr(tc, 'type', None) == 'function_call']
    if tool_calls:
        for tool_call in tool_calls:
            name = tool_call.name
            args = json.loads(tool_call.arguments)
            call_id = tool_call.call_id
            user = args.get("user")

            tool_call_fn.delay(name, call_id, args)

        conversation.append(
            {
                "role": "system",
                "content": [{"type": "input_text", "text": f" tell user that tool call is in progress {name}, in professional way"}]
            }
        )
        print(conversation)
        response2 = client.responses.create(
            model=model_name,
            input=conversation,
            text={"format": {"type": "text"}},
            reasoning={},
            tools=[mongo_query_tool_schema, discord_tool_schema],
            temperature=1,
            max_output_tokens=2048,
            top_p=1,
            store=True
        )
        #
        # # Remove non-serializable objects from conversation before returning
        def serializable_convo(convo):
            serializable = []
            for item in convo:
                if isinstance(item, dict):
                    serializable.append(item)
                elif hasattr(item, '__dict__'):
                    serializable.append(item.__dict__)
                elif isinstance(item, str):
                    serializable.append(item)
                # else: skip non-serializable objects
            return serializable
        # print(" Before returning tools call" , tool_calls)
        # print(response2.output_text)
        return JSONResponse({
            "output": response2.output_text,
            "conversation": serializable_convo(conversation),
            # Frontend should poll with tool_calls and message_id until status is 'completed'
            "waiting_for_tool_call": {
                "tool_calls": serializable_convo(tool_calls),
                "message_id": call_id,
            }
        })

    # If no tool call, return model output and conversation history
    def serializable_convo(convo):
        serializable = []
        for item in convo:
            if isinstance(item, dict):
                serializable.append(item)
            elif hasattr(item, '__dict__'):
                serializable.append(item.__dict__)
            elif isinstance(item, str):
                serializable.append(item)
            # else: skip non-serializable objects
        return serializable
    print(response.output_text)
    return JSONResponse({
        "output": response.output_text,
        "conversation": serializable_convo(conversation)
    })

