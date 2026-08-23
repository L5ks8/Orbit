import json

file_path = r"C:\Users\lukeb\.gemini\antigravity-ide\brain\6a2bd072-0b2e-48af-af35-a8d170f66470\.system_generated\logs\transcript_full.jsonl"
with open(file_path, "r", encoding="utf-8") as f:
    for line in f:
        data = json.loads(line)
        if data.get("type") == "USER_INPUT" and "bg-neutral-900 rounded-2xl border" in data.get("content", ""):
            content = data["content"]
            # Just print the exact HTML parts of interest
            import re
            html_parts = re.findall(r'<button type="button" role="switch"[^>]+>.*?</button>', content)
            if html_parts:
                print("TOGGLE HTML:", html_parts[0])
            
            # Print the inputs
            inputs = re.findall(r'<input[^>]+>', content)
            print("INPUTS HTML:")
            for inp in inputs:
                print(inp)
            break
