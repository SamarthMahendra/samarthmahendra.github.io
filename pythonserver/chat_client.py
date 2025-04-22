import requests

API_URL = "http://localhost:8000/agent/run"

def chat():
    print("Welcome to the Python Agent Chat Client! Type 'exit' to quit.\n")
    while True:
        user_input = input("You: ")
        if user_input.strip().lower() in {"exit", "quit"}:
            print("Goodbye!")
            break
        try:
            resp = requests.post(
                API_URL,
                json={"message": user_input},
                timeout=60
            )
            if resp.ok:
                data = resp.json()
                print(f"Agent: {data.get('output', '[No output]')}")
            else:
                print(f"[Error] Server returned status {resp.status_code}: {resp.text}")
        except Exception as e:
            print(f"[Error] {e}")

if __name__ == "__main__":
    chat()
