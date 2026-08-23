import re

file_path = r"c:\Users\lukeb\OneDrive\Projects\Original\Bots\Orbit\Website\frontend\src\components\dashboard\Moderation.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Make the input fields lighter: bg-neutral-800 -> bg-neutral-700 (or bg-[#2a2a2a])
# Fix the overlapping icons by increasing the padding-left or using inline style paddingLeft
# The problem is that Tailwind might not be picking up 'pl-10' or 'pl-12'. I will use style={{ paddingLeft: "2.5rem" }} to be 100% sure.

content = re.sub(
    r'<input(.*?)className="w-full h-10 pl-10 pr-9 bg-neutral-800 border border-neutral-700',
    r'<input\1className="w-full h-10 pr-9 bg-[#2A2A2A] border border-neutral-600" style={{ paddingLeft: "2.5rem" }}',
    content
)

content = re.sub(
    r'<input(.*?)className="w-full h-10 pl-10 pr-3 bg-neutral-800 border border-neutral-700',
    r'<input\1className="w-full h-10 pr-3 bg-[#2A2A2A] border border-neutral-600" style={{ paddingLeft: "2.5rem" }}',
    content
)

# Also let's make the custom selects (Timeout, Ban) lighter if they meant those.
# The user said "mach diue dropdowns hellder" (make the dropdowns lighter).
# I will change darker={true} to darker={false} in ActionSelector for CustomSelect.
content = re.sub(
    r'darker=\{true\}',
    r'darker={false}',
    content
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated successfully.")
