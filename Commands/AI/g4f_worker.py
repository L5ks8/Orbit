import sys
import json
import g4f

def main():
    try:
        input_data = sys.stdin.read()
        messages = json.loads(input_data)
        response = g4f.ChatCompletion.create(
            model='gpt-4o',
            messages=messages
        )
        print("G4F_RESULT:" + json.dumps({"success": True, "response": response}))
    except Exception as e:
        print("G4F_RESULT:" + json.dumps({"success": False, "error": str(e)}))

if __name__ == "__main__":
    main()
