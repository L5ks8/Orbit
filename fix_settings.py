import re

file_path = r"c:\Users\lukeb\OneDrive\Projects\Original\Bots\Orbit\Website\frontend\src\components\dashboard\modules\WelcomeSettings.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix pointer-events-none for DM on Join / DM on Leave
# I'll replace `<div className="pointer-events-none select-none flex flex-col flex-1">` 
# with `<div className="flex flex-col flex-1">`
content = content.replace(
    '<div className="pointer-events-none select-none flex flex-col flex-1">',
    '<div className="flex flex-col flex-1">'
)

# Wait, there's also an `pointer-events-none select-none` for the "Embed Image" starter placeholder maybe?
# Let's check how many times it appears. If I just replace all, I might break the Starter placeholder.
# Let's be more specific. 
# The one for DM on Join is under `<div data-tour="welcome-dm"`
# Let's just do a specific regex replace for the DM ones.
