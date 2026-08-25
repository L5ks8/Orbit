import re

file_path = r"c:\Users\lukeb\OneDrive\Projects\Original\Bots\Orbit\Website\frontend\src\components\dashboard\modules\WelcomeSettings.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

goodbye_title_html = """
                          <div className="relative rounded-xl border border-neutral-700/50 bg-neutral-800/50 focus-within:border-neutral-500 transition-colors">
                            <input
                              type="text"
                              value={goodbyeEmbedTitle}
                              onChange={e => setGoodbyeEmbedTitle(e.target.value)}
                              placeholder="Embed Title"
                              className="relative block w-full focus:outline-none bg-transparent text-[16px] leading-6 sm:text-[13px] sm:leading-5 text-white placeholder-neutral-500 px-4 py-2"
                              style={{ fontFamily: '"Cascadia Code", "Fira Code", "JetBrains Mono", Consolas, Monaco, monospace' }}
                            />
                          </div>
"""

pattern = r'(<div\s+className="relative rounded-xl border border-neutral-700/50 bg-neutral-800/50 focus-within:border-neutral-500 transition-colors "\s+style=\{\{ minHeight: 84 \}\}\s*>\s*<textarea\s+rows=\{3\}\s+ref=\{goodbyeDescRef\})'
content = re.sub(pattern, goodbye_title_html + r'\1', content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated goodbye title successfully.")
