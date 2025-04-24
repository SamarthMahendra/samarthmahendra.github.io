import os
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from openai import OpenAI, api_key
from flask_cors import CORS

load_dotenv()
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes







import discord_tool
import asyncio
import mongo_tool
import json

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


@app.route("/talk_to_samarth_discord", methods=["POST"])
def talk_to_samarth_discord_api():
    data = request.get_json()
    message = data.get("message")
    result = talk_to_manager_discord(message)
    return jsonify({"result": result})

@app.route("/mongo_query", methods=["POST"])
def mongo_query_api():
    result = mongo_tool.query_mongo_db_for_candidate_profile()
    return jsonify({"result": result})



@app.route("/health", methods=["GET"])
def health():
    response = jsonify({"status": "OK"})
    return response

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
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
        print("Continuing conversation")
        conversation.append({
            "role": "user",
            "content": [{"type": "input_text", "text": message}]
        })




    response = client.responses.create(
        model="gpt-4.1-nano-2025-04-14",
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
            if name == "talk_to_samarth_discord":
                result = talk_to_manager_discord(args["message"]["content"])
            elif name == "query_profile_info":
                print(args)
                result = mongo_tool.query_mongo_db_for_candidate_profile()
            else:
                result = f"Unknown tool: {name}"
            # Ensure output is always a string for OpenAI API
            if not isinstance(result, str):
                import json as _json
                output_str = _json.dumps(result, ensure_ascii=False)
            else:
                output_str = result
            tool_outputs.append({
                "type": "function_call_output",
                "call_id": call_id,
                "output": output_str
            })
        # Add tool calls and outputs to conversation
        conversation += [tc for tc in tool_calls]
        conversation += tool_outputs

        print(conversation)
        response2 = client.responses.create(
            model="gpt-4.1-nano-2025-04-14",
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
        return jsonify({
            "output": response2.output_text,
            "conversation": serializable_convo(conversation)
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
    return jsonify({
        "output": response.output_text,
        "conversation": serializable_convo(conversation)
    })

if __name__ == "__main__":
    # Run with host="0.0.0.0" to make it accessible from other devices on the network
    app.run(host="0.0.0.0", port=8001, debug=True)
