import re

file_path = r"c:\Users\lukeb\OneDrive\Projects\Original\Bots\Orbit\Website\frontend\src\components\dashboard\modules\WelcomeSettings.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Let's see the structure:
# <div className="space-y-2.5">
#   <div className="flex items-stretch gap-2"> (welcomeText)
#   <div className="relative rounded-xl border ..."> (welcomeEmbedDesc)
# </div>

# We want to add welcomeEmbedTitle BEFORE welcomeEmbedDesc.
title_html = """
                    <div className="relative rounded-xl border border-neutral-700/50 bg-neutral-800/50 focus-within:border-neutral-500 transition-colors">
                      <input
                        type="text"
                        value={welcomeEmbedTitle}
                        onChange={e => setWelcomeEmbedTitle(e.target.value)}
                        placeholder="Embed Title"
                        className="relative block w-full focus:outline-none bg-transparent text-[16px] leading-6 sm:text-[13px] sm:leading-5 text-white placeholder-neutral-500 px-4 py-2"
                        style={{ fontFamily: '"Cascadia Code", "Fira Code", "JetBrains Mono", Consolas, Monaco, monospace' }}
                      />
                    </div>
"""

content = content.replace(
    '                    <div\n                      className="relative rounded-xl border border-neutral-700/50 bg-neutral-800/50 focus-within:border-neutral-500 transition-colors "\n                      style={{ minHeight: 84 }}\n                    >\n                      <textarea\n                        rows={3}\n                        ref={welcomeDescRef}',
    title_html + '                    <div\n                      className="relative rounded-xl border border-neutral-700/50 bg-neutral-800/50 focus-within:border-neutral-500 transition-colors "\n                      style={{ minHeight: 84 }}\n                    >\n                      <textarea\n                        rows={3}\n                        ref={welcomeDescRef}'
)

# And for goodbye:
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
content = content.replace(
    '                    <div\n                      className="relative rounded-xl border border-neutral-700/50 bg-neutral-800/50 focus-within:border-neutral-500 transition-colors "\n                      style={{ minHeight: 84 }}\n                    >\n                      <textarea\n                        rows={3}\n                        ref={goodbyeDescRef}',
    goodbye_title_html + '                    <div\n                      className="relative rounded-xl border border-neutral-700/50 bg-neutral-800/50 focus-within:border-neutral-500 transition-colors "\n                      style={{ minHeight: 84 }}\n                    >\n                      <textarea\n                        rows={3}\n                        ref={goodbyeDescRef}'
)

# Now, we need to extract the Embed Fields block from INSIDE the flex-wrap container
# and put it AFTER the flex-wrap container, followed by the Footer field.

welcome_embed_fields_regex = r'(\{welcomeMsgMode === "embed" && \(\s*<div className="pt-4 border-t border-neutral-800/60 mt-4 space-y-3">\s*<div className="flex items-center justify-between">.*?</span>\s*</div>\s*\)\})'
welcome_fields_match = re.search(welcome_embed_fields_regex, content, flags=re.DOTALL)
if welcome_fields_match:
    fields_block = welcome_fields_match.group(1)
    # Remove it from current position
    content = content.replace(fields_block, "")
    
    # We want to place it right after the closing </div> of the flex-wrap container.
    # The flex-wrap container ends right before `<div className="relative  " role="button"` (the Embed Image Starter placeholder)
    
    # Wait, the structure is:
    # <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 border-t border-neutral-800/60">
    #   ... mode select and avatar toggle ...
    # </div>
    # <div className="relative  " role="button" ...> (Embed Image Starter)
    
    footer_block = """
                  {welcomeMsgMode === "embed" && (
                    <div className="relative rounded-xl border border-neutral-700/50 bg-neutral-800/50 focus-within:border-neutral-500 transition-colors mt-3">
                      <input
                        type="text"
                        value={welcomeEmbedFooter}
                        onChange={e => setWelcomeEmbedFooter(e.target.value)}
                        placeholder="Embed Footer"
                        className="relative block w-full focus:outline-none bg-transparent text-[16px] leading-6 sm:text-[13px] sm:leading-5 text-white placeholder-neutral-500 px-4 py-2"
                        style={{ fontFamily: '"Cascadia Code", "Fira Code", "JetBrains Mono", Consolas, Monaco, monospace' }}
                      />
                    </div>
                  )}
"""
    new_block = fields_block.replace('mt-4', '') + footer_block
    
    # Insert it right before the Embed Image Starter container
    starter_pattern = r'(<div\s+className="relative\s+"\s+role="button"\s+tabIndex=\{0\}\s+style=\{\{ cursor: "default" \}\}\s*>)'
    content = re.sub(starter_pattern, new_block + r'\1', content, count=1)


goodbye_embed_fields_regex = r'(\{goodbyeMsgMode === "embed" && \(\s*<div className="pt-4 border-t border-neutral-800/60 mt-4 space-y-3">\s*<div className="flex items-center justify-between">.*?</span>\s*</div>\s*\)\})'
goodbye_fields_match = re.search(goodbye_embed_fields_regex, content, flags=re.DOTALL)
if goodbye_fields_match:
    fields_block = goodbye_fields_match.group(1)
    content = content.replace(fields_block, "")
    
    footer_block = """
                  {goodbyeMsgMode === "embed" && (
                    <div className="relative rounded-xl border border-neutral-700/50 bg-neutral-800/50 focus-within:border-neutral-500 transition-colors mt-3">
                      <input
                        type="text"
                        value={goodbyeEmbedFooter}
                        onChange={e => setGoodbyeEmbedFooter(e.target.value)}
                        placeholder="Embed Footer"
                        className="relative block w-full focus:outline-none bg-transparent text-[16px] leading-6 sm:text-[13px] sm:leading-5 text-white placeholder-neutral-500 px-4 py-2"
                        style={{ fontFamily: '"Cascadia Code", "Fira Code", "JetBrains Mono", Consolas, Monaco, monospace' }}
                      />
                    </div>
                  )}
"""
    new_block = fields_block.replace('mt-4', '') + footer_block
    
    # The starter container for goodbye
    # We replaced it for welcome above by `count=1`, so doing it again for goodbye should match the second occurrence
    starter_pattern = r'(<div\s+className="relative\s+"\s+role="button"\s+tabIndex=\{0\}\s+style=\{\{ cursor: "default" \}\}\s*>)'
    # Actually it's safer to split by a known goodbye string
    goodbye_split = content.split('Goodbye Messages')
    if len(goodbye_split) == 2:
        goodbye_split[1] = re.sub(starter_pattern, new_block + r'\1', goodbye_split[1], count=1)
        content = 'Goodbye Messages'.join(goodbye_split)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated embed builder structure.")
