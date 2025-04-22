# Python Agent Server

This Flask-based server implements an LLM agent using the `agents` framework. It supports tools, context, and streaming responses, and is designed to be a backend for agentic workflows.

## Setup

1. Create a virtual environment:
   ```sh
   python3 -m venv venv
   source venv/bin/activate
   ```
2. Install dependencies:
   ```sh
   pip install flask agents openai pydantic
   ```
3. Set your OpenAI API key as an environment variable:

4. Run the server:
   ```sh
   python app.py
   ```

## Endpoints
- `/agent/run` : POST endpoint to run the agent with a user message and (optionally) context.
- `/health` : Simple health check.

## Agent Features
- Tool use via Python functions
- Context injection
- Streaming support (soon)

---

Edit `app.py` to add tools, context, and agent configuration as needed.
