import re

file_path = r"c:\Users\lukeb\OneDrive\Projects\Original\Bots\Orbit\Website\frontend\src\components\dashboard\modules\WelcomeSettings.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix pointer-events-none for DM on Join / DM on Leave
# There are 3 places: DM on Join, DM on Leave, and Embed Image.
# I will only replace the ones for DM on Join and Leave by matching the context.
content = re.sub(
    r'(<div\s+data-tour="welcome-dm"[^>]*>.*?<div className=")pointer-events-none select-none (flex flex-col flex-1">)',
    r'\1\2',
    content,
    flags=re.DOTALL
)

content = re.sub(
    r'(<div\s+data-tour="goodbye-dm"[^>]*>.*?<div className=")pointer-events-none select-none (flex flex-col flex-1">)',
    r'\1\2',
    content,
    flags=re.DOTALL
)
# Note: Actually the pointer-events-none is ON the parent container:
# <div className="pointer-events-none select-none flex flex-col flex-1">
#   <div data-tour="welcome-dm" ...>
# So the regex above is wrong. Let's fix it by simply removing "pointer-events-none select-none " 
# from the div right before `<div data-tour="welcome-dm"` and `<div data-tour="goodbye-dm"`
content = re.sub(
    r'className="pointer-events-none select-none flex flex-col flex-1"(\s*>\s*<div\s+data-tour="(?:welcome|goodbye)-dm")',
    r'className="flex flex-col flex-1"\1',
    content
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated pointer events.")
