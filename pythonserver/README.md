# Python Agent Chatbot Server

This server implements an LLM-powered agentic chatbot with tool calls, context, and Discord/MongoDB integration. It uses Flask for the API, Celery for background tasks, Redis as the broker, and MongoDB for storage.

## Features
- **Flask**: REST API backend
- **Celery**: Async tool calls
- **Redis**: Celery broker/result backend
- **MongoDB**: Candidate profile and tool call storage
- **Discord**: Send/receive messages via bot
- **LLM Tool Calls**: Agent can trigger tools in background

---

## Local Development Setup

### 1. Clone and Prepare
```sh
cd pythonserver
python3 -m venv .venv
source .venv/bin/activate
```

### 2. Install Dependencies
```sh
pip install -r requirements.txt
```
If `requirements.txt` is missing, install at least:
```sh
pip install flask celery redis pymongo openai discord.py
```

### 3. Start Local Services
- **Redis:**
  - Install via Homebrew: `brew install redis`
  - Start: `redis-server`

- **MongoDB:**
  - Install via Homebrew: `brew tap mongodb/brew && brew install mongodb-community`
  - Start: `brew services start mongodb-community`

### 4. Configure Environment Variables
Create a `.env` file or export these variables:
```
OPENAI_API_KEY=your-openai-key
DISCORD_TOKEN=your-discord-bot-token
DISCORD_CHANNEL_ID=your-discord-channel-id
MONGO_URI=mongodb://localhost:27017/
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
```

### 5. Run the Flask Server
```sh
python app.py
```

### 6. Run the Celery Worker (in a new terminal, same venv)
```sh
celery -A celery_worker.celery_app worker --loglevel=info
```

---

## Endpoints
- `/chat` : Main chat endpoint for agentic conversation and tool calls.
- `/health` : Health check.

## Troubleshooting
- **Celery not connecting?** Make sure Redis is running and env vars are correct.
- **MongoDB errors?** Ensure MongoDB is running and accessible.
- **Discord issues?** Make sure your bot token is correct and the bot is invited to the right server/channel.
- **Async errors?** All tool calls are now sync-compatible.

## Customization
- Edit `mongo_tool.py` for MongoDB logic.
- Edit `discord_tool.py` for Discord bot logic.
- Edit `app.py` for API and agent orchestration.

---

For further help, see the code comments or open an issue!
