import os

files_to_edit = [
    "Commands/_utils.py",
    "Commands/Warn/warn.py",
    "Commands/Verify/_views.py",
    "Commands/Level/level.py",
    "Commands/Invite/leaderboard.py",
    "Commands/Info/botinfo.py",
    "Commands/Economy/economy.py",
    "Commands/OwnerOnly/update.py"
]

for f in files_to_edit:
    if not os.path.exists(f): continue
    with open(f, "r", encoding="utf-8") as file:
        content = file.read()
    
    if "import os" not in content:
        content = "import os\n" + content
        
    content = content.replace('"https://orbit-498b.onrender.com"', 'os.environ.get("BASE_URL", "https://orbit-498b.onrender.com")')
    content = content.replace('f"https://orbit-498b.onrender.com', 'f"{os.environ.get(\'BASE_URL\', \'https://orbit-498b.onrender.com\')}')
    
    with open(f, "w", encoding="utf-8") as file:
        file.write(content)

html_path = "Website/frontend/index.html"
if os.path.exists(html_path):
    with open(html_path, "r", encoding="utf-8") as file:
        content = file.read()
    content = content.replace("https://orbit-498b.onrender.com", "%VITE_BASE_URL%")
    with open(html_path, "w", encoding="utf-8") as file:
        file.write(content)

jsx_path = "Website/frontend/src/pages/Docs.jsx"
if os.path.exists(jsx_path):
    with open(jsx_path, "r", encoding="utf-8") as file:
        content = file.read()
    content = content.replace("'orbit-498b.onrender.com'", "(import.meta.env.VITE_BASE_URL || 'https://orbit-498b.onrender.com').replace(/^https?:\\/\\//, '')")
    with open(jsx_path, "w", encoding="utf-8") as file:
        file.write(content)

print("Replacement complete.")
