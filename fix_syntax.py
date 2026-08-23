import re

file_path = r"c:\Users\lukeb\OneDrive\Projects\Original\Bots\Orbit\Website\frontend\src\components\dashboard\Moderation.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix the broken Search input
content = content.replace(
    'className="w-full h-10 pr-9 bg-[#2A2A2A] border border-neutral-600" style={{ paddingLeft: "2.5rem" }} rounded-lg text-sm text-white placeholder-neutral-500 outline-none hover:border-neutral-600 transition-[border-color,box-shadow] duration-150 ease-out focus:border-neutral-600 focus:ring-2 focus:ring-white/10"',
    'className="w-full h-10 pr-9 bg-[#2A2A2A] border border-neutral-600 rounded-lg text-sm text-white placeholder-neutral-500 outline-none hover:border-neutral-600 transition-[border-color,box-shadow] duration-150 ease-out focus:border-neutral-600 focus:ring-2 focus:ring-white/10" style={{ paddingLeft: "2.5rem" }}'
)

# Fix the broken Add input
content = content.replace(
    'className="w-full h-10 pr-3 bg-[#2A2A2A] border border-neutral-600" style={{ paddingLeft: "2.5rem" }} rounded-lg text-sm text-white placeholder-neutral-500 outline-none hover:border-neutral-600 transition-[border-color,box-shadow] duration-150 ease-out focus:border-neutral-600 focus:ring-2 focus:ring-white/10"',
    'className="w-full h-10 pr-3 bg-[#2A2A2A] border border-neutral-600 rounded-lg text-sm text-white placeholder-neutral-500 outline-none hover:border-neutral-600 transition-[border-color,box-shadow] duration-150 ease-out focus:border-neutral-600 focus:ring-2 focus:ring-white/10" style={{ paddingLeft: "2.5rem" }}'
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Syntax error fixed successfully.")
