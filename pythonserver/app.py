import os
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from celery import Celery
from dotenv import load_dotenv
from openai import OpenAI, api_key

from celery_worker import celery_app, tool_call_fn



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
import uuid
from datetime import datetime
from fastapi import Body

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


def generate_jitsi_meeting_url(user_name=None):
    from mongo_tool import insert_meeting
    base_url = "https://meet.jit.si/"
    if user_name:
        meeting_name = f"{user_name}-{datetime.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6]}"
    else:
        meeting_name = f"SamarthMeeting-{datetime.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6]}"

    return base_url + meeting_name

# Tool schema for ChatGPT function calling
schedule_meeting_tool_schema = {
    "type": "function",
    "name": "schedule_meeting_on_jitsi",
    "description": "Function to Schedule a meeting with Samarth and others on Jitsi, store meeting in MongoDB, and send an email invite with the Jitsi link. dont ask too much just schedule the meeting",
    "parameters": {
        "type": "object",
        "properties": {
            "members": {
                "type": "array",
                "items": {"type": "string"},
                "description": "List of member emails (apart from Samarth)"
            },
            "agenda": {"type": "string", "description": "Agenda for the meeting"},
            "timing": {"type": "string", "description": "Meeting time/date in ISO format"},
            "user_email": {"type": "string", "description": "Email of the user scheduling the meeting (for invite)"}
        },
        "required": ["members", "agenda", "timing", "user_email"]
    }
}



# Tool schema for ChatGPT function calling
schedule_meeting_tool_schema = {
    "type": "function",
    "name": "check_tool_output",
    "description": "Function to check previous tool output",
    "parameters": {
        "type": "object",
        "properties": {
            "call_id": {"type": "string", "description": "tool call id"}
        },
        "required": ["call_id"]
    }
}


def


def schedule_meeting(args):
    # args: dict with keys members, agenda, timing, user_email
    members = args.get("members", [])
    agenda = args.get("agenda")
    timing = args.get("timing")
    user_email = args.get("user_email")
    # Always include Samarth
    if "samarth@samarthmahendra.com" not in members:
        members.append("samarth@samarthmahendra.com")
    print(members, agenda, timing, user_email)
    meeting_url = generate_jitsi_meeting_url("samarth")
    meeting_id = mongo_tool.insert_meeting(members, agenda, timing, meeting_url)

    print(" Sending email : ", user_email, meeting_url)
    tool_call_fn.delay("send_meeting_email", None, {"email": user_email, "meeting_url": meeting_url})

    # ping samarth on discord about the meeting
    # celery_app.send_task("tool_call_fn", args=("talk_to_samarth_discord", None, {"action": "send", "message": {"content": f"Meeting scheduled with {', '.join(members)} on {timing} for {agenda}. Meeting link: {meeting_url}"}}))
    tool_call_fn.delay("talk_to_samarth_discord", None, {"action": "send", "message": {"content": f"Meeting scheduled with {', '.join(members)} on {timing} for {agenda}. Meeting link: {meeting_url}"}})
    return {"meeting_url": meeting_url, "meeting_id": meeting_id}

mongo_query_tool_schema = {
"type": "function",
  "name": "query_profile_info",
  "description": "Function to query profile information, requiring no input parameters for Job fit or any resume information.",
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



def check_tool_output(message_id):
    result = mongo_tool.get_tool_message_status(message_id)
    return result 

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



@app.get("/")
async def root():
    return {"status": "ok", "message": "FastAPI server is running"}



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
                "content": [{"type": "input_text", "text": "You are Samarth Mahendra’s AI personal assistant.\n\nYour capabilities include:\n- Communicating with Samarth via Discord to ask questions or relay information.\n- Querying a MongoDB database to retrieve or verify candidate profiles and job fit.\n- Scheduling meetings using Jitsi and sending out meeting invitations.\n- You can query the database for any information about Samarth.\n\nGuidelines:\n- Before pinging Samarth on Discord, always gather all relevant information from the user or available sources.\n- When evaluating if someone is a good match for a job, always gather the job information first, then check the candidate profile using the MongoDB tool.\n- When checking Samarth’s availability for meetings, never query the database; always confirm with Samarth directly on Discord.\n- Always act professionally and on behalf of Samarth.\n- If you are unsure or need Samarth’s input, communicate with him via Discord."}]
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

        response3 = client.responses.create(
            model=model_name,
            input=conversation,
            text={"format": {"type": "text"}},
            reasoning={},
            tools=[mongo_query_tool_schema, discord_tool_schema, schedule_meeting_tool_schema],
            temperature=1,
            max_output_tokens=2048,
            top_p=1,
            store=True
        )

        tool_outputs = []
        tool_calls = [tc for tc in response3.output if getattr(tc, 'type', None) == 'function_call']
        if tool_calls:
            for tool_call in tool_calls:
                print("tool call", tool_call.name)
                name = tool_call.name
                args = json.loads(tool_call.arguments)
                call_id = tool_call.call_id
                user = args.get("user")
                if name == 'schedule_meeting_on_jitsi':
                    print("schedule_meeting_on_jitsi")
                    result = schedule_meeting(args)
                    output_str = json.dumps(result, ensure_ascii=False)
                    conversation += [tc for tc in tool_calls]
                    tool_outputs.append({
                        "type": "function_call_output",
                        "call_id": call_id,
                        "output": output_str
                    })
                    conversation += tool_outputs
                    response4 = client.responses.create(
                        model=model_name,
                        input=conversation,
                        text={"format": {"type": "text"}},
                        reasoning={},
                        tools=[mongo_query_tool_schema, discord_tool_schema, schedule_meeting_tool_schema],
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

                    return JSONResponse({
                        "output": response4.output_text,
                        "conversation": serializable_convo(conversation),
                    })


                else:
                    tool_call_fn.delay(name, call_id, args)

            conversation.append(
                {
                    "role": "system",
                    "content": [{"type": "input_text",
                                 "text": f" tell user that tool call is in progress {name}, in professional way"}]
                }
            )
            print(conversation)
            response5 = client.responses.create(
                model=model_name,
                input=conversation,
                text={"format": {"type": "text"}},
                reasoning={},
                tools=[mongo_query_tool_schema, discord_tool_schema, schedule_meeting_tool_schema],
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
                "output": response5.output_text,
                "conversation": serializable_convo(conversation),
                # Frontend should poll with tool_calls and message_id until status is 'completed'
                "waiting_for_tool_call": {
                    "tool_calls": serializable_convo(tool_calls),
                    "message_id": call_id,
                }
            })



    print("conversation from frontend", conversation)
    response = client.responses.create(
        model=model_name,
        input=conversation,
        text={"format": {"type": "text"}},
        reasoning={},
        tools=[mongo_query_tool_schema, discord_tool_schema, schedule_meeting_tool_schema],
        temperature=1,
        max_output_tokens=2048,
        top_p=1,
        store=True
    )
    tool_outputs = []
    tool_calls = [tc for tc in response.output if getattr(tc, 'type', None) == 'function_call']
    if tool_calls:
        for tool_call in tool_calls:
            print("tool call", tool_call.name)
            name = tool_call.name
            args = json.loads(tool_call.arguments)
            call_id = tool_call.call_id
            user = args.get("user")
            if name == 'schedule_meeting_on_jitsi':
                print("schedule_meeting_on_jitsi")
                result = schedule_meeting(args)
                output_str = json.dumps(result, ensure_ascii=False)
                conversation += [tc for tc in tool_calls]
                tool_outputs.append({
                    "type": "function_call_output",
                    "call_id": call_id,
                    "output": output_str
                })
                conversation += tool_outputs
                response2 = client.responses.create(
                    model=model_name,
                    input=conversation,
                    text={"format": {"type": "text"}},
                    reasoning={},
                    tools=[mongo_query_tool_schema, discord_tool_schema, schedule_meeting_tool_schema],
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

                return JSONResponse({
                    "output": response2.output_text,
                    "conversation": serializable_convo(conversation),
                })


            else:
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
            tools=[mongo_query_tool_schema, discord_tool_schema, schedule_meeting_tool_schema],
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

