import re

file_path = r"c:\Users\lukeb\OneDrive\Projects\Original\Bots\Orbit\Website\frontend\src\components\dashboard\Moderation.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace my custom bg-[#2A2A2A] with the original bg-neutral-800
content = content.replace('bg-[#2A2A2A]', 'bg-neutral-800')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated successfully.")
