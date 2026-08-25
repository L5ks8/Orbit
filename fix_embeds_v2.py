import re

file_path = r"c:\Users\lukeb\OneDrive\Projects\Original\Bots\Orbit\Website\frontend\src\components\dashboard\modules\WelcomeSettings.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

def extract_and_move(content, msg_mode_var, footer_state_var, footer_setter):
    start_tag = f'{{{msg_mode_var} === "embed" && (\n                    <div className="pt-4 border-t border-neutral-800/60 mt-4 space-y-3">'
    if start_tag not in content:
        print(f"Could not find start tag for {msg_mode_var}")
        return content
        
    start_index = content.find(start_tag)
    # We need to find the matching ')}' for this block.
    # The block ends with:
    #                       </div>
    #                     </div>
    #                   )}
    
    end_tag = ')}'
    
    # We find the next ')}' that is properly indented or just use a simple approach:
    # We know the block contains `<span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Embed Fields</span>`
    # Let's find the `)}` that comes after the map function `))} </div> </div> )}`
    search_end = content.find(')}', start_index)
    while True:
        # Check if the text between start_index and search_end has equal number of '{' and '}'
        # A simpler way is to just find `                  )}` (indentation of 18 spaces)
        block = content[start_index:search_end+2]
        if block.count('(') == block.count(')') and block.count('{') == block.count('}'):
            break
        search_end = content.find(')}', search_end + 2)
        if search_end == -1:
            print("Failed to find end of block")
            return content
            
    fields_block = content[start_index:search_end+2]
    content = content.replace(fields_block, "")
    
    footer_block = f"""
                  {{{msg_mode_var} === "embed" && (
                    <div className="relative rounded-xl border border-neutral-700/50 bg-neutral-800/50 focus-within:border-neutral-500 transition-colors mt-3 mb-4">
                      <input
                        type="text"
                        value={{{footer_state_var}}}
                        onChange={{e => {footer_setter}(e.target.value)}}
                        placeholder="Embed Footer"
                        className="relative block w-full focus:outline-none bg-transparent text-[16px] leading-6 sm:text-[13px] sm:leading-5 text-white placeholder-neutral-500 px-4 py-2"
                        style={{{{ fontFamily: '"Cascadia Code", "Fira Code", "JetBrains Mono", Consolas, Monaco, monospace' }}}}
                      />
                    </div>
                  )}}
"""
    new_block = fields_block.replace('mt-4', '') + footer_block
    
    # Find the starter placeholder to insert before
    # For Welcome: It's right before `<div className="relative  " role="button" tabIndex={0} style={{ cursor: "default" }}>`
    # For Goodbye: Same thing, but there are multiple. 
    # Let's find the first one AFTER our current position (start_index)
    
    starter_str = '<div\n                    className="relative  "\n                    role="button"\n                    tabIndex={0}\n                    style={{ cursor: "default" }}\n                  >'
    if starter_str not in content:
        # try a different format
        starter_str = '<div className="relative  " role="button" tabIndex={0} style={{ cursor: "default" }}>'
    
    # regex search for starter
    starter_match = re.search(r'<div[^>]*className="relative\s*"[^>]*role="button"[^>]*>', content[start_index:])
    if starter_match:
        insert_idx = start_index + starter_match.start()
        content = content[:insert_idx] + new_block + content[insert_idx:]
    else:
        print("Failed to find starter to insert before")
    
    return content

content = extract_and_move(content, "welcomeMsgMode", "welcomeEmbedFooter", "setWelcomeEmbedFooter")
content = extract_and_move(content, "goodbyeMsgMode", "goodbyeEmbedFooter", "setGoodbyeEmbedFooter")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated embed builder structure successfully.")
