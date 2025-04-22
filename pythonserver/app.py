import os
from flask import Flask, request, jsonify
from openai import OpenAI
from dotenv import load_dotenv

# Load .env for OPENAI_API_KEY and other secrets
load_dotenv()
api_key = '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'


app = Flask(__name__)

# Initialize OpenAI client
client = OpenAI(api_key=api_key)

@app.route("/health", methods=["GET"])
def health():
    return "OK"

# Create or retrieve an Assistant (Agent) at startup
from threading import Lock
agent_id = None
agent_lock = Lock()
def get_or_create_agent():
    global agent_id
    with agent_lock:
        if agent_id is not None:
            return agent_id
        # Try to find an existing assistant with the same name/model
        assistants = list(client.beta.assistants.list().data)
        for assistant in assistants:
            if assistant.name == "Haiku Agent" and assistant.model == "gpt-4.1-nano":
                agent_id = assistant.id
                return agent_id
        # Otherwise, create a new one
        assistant = client.beta.assistants.create(
            name="Haiku Agent",
            instructions="Always respond in haiku form.",
            model="gpt-4.1-nano",
            tools=[]
        )
        agent_id = assistant.id
        return agent_id

AGENT_ID = get_or_create_agent()

@app.route("/agent/run", methods=["POST"])
def run_agent():
    data = request.json
    message = data.get("message", "")
    # Create a new thread for this conversation
    thread = client.beta.threads.create()
    # Add the user message to the thread
    client.beta.threads.messages.create(
        thread_id=thread.id,
        role="user",
        content=message
    )
    # Run the agent (assistant) on the thread
    run = client.beta.threads.runs.create(
        thread_id=thread.id,
        assistant_id=AGENT_ID,
        instructions="Always respond in haiku form."
    )
    # Wait for the run to complete (polling)
    import time
    while True:
        run_status = client.beta.threads.runs.retrieve(thread_id=thread.id, run_id=run.id)
        if run_status.status in ["completed", "failed", "cancelled"]:
            break
        time.sleep(1)
    # Get the assistant's reply
    messages = client.beta.threads.messages.list(thread_id=thread.id)
    for msg in reversed(messages.data):
        if msg.role == "assistant":
            return jsonify({"output": msg.content[0].text.value})
    return jsonify({"output": "No reply from agent."})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
