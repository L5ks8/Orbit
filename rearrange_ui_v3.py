import re

file_path = r"c:\Users\lukeb\OneDrive\Projects\Original\Bots\Orbit\Website\frontend\src\components\dashboard\modules\WelcomeSettings.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update the background colors of the added embed fields (New Field, Value)
content = content.replace(
    'className="flex-1 bg-neutral-900 border border-neutral-700 rounded-md',
    'className="flex-1 bg-neutral-800/50 border border-neutral-700/50 rounded-md'
)
content = content.replace(
    'className="w-full bg-neutral-900 border border-neutral-700 rounded-md',
    'className="w-full bg-neutral-800/50 border border-neutral-700/50 rounded-md'
)

def rearrange_blocks(content, prefix, state_prefix):
    # Extract Dropdown block
    dropdown_start_str = '<div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 border-t border-neutral-800/60">'
    dropdown_start = content.find(dropdown_start_str, content.find(f'data-setter="{prefix}Text"'))
    if dropdown_start != -1:
        # Find the end of dropdown block
        toggle_str = f'checked={{{state_prefix}EmbedThumbnail === "{{user.avatar}}"}}'
        toggle_idx = content.find(toggle_str, dropdown_start)
        if toggle_idx != -1:
            end_idx = content.find('</div>', toggle_idx) # End of toggle div
            end_idx = content.find('</div>', end_idx + 6) # End of inner flex
            end_idx = content.find('</div>', end_idx + 6) # End of flex wrap div
            end_idx += 6
            dropdown_block = content[dropdown_start:end_idx]
            content = content.replace(dropdown_block, '')
            clean_dropdown_block = dropdown_block.replace('pt-2 border-t border-neutral-800/60', 'pb-4 mb-2 border-b border-neutral-800/60')
            
            # Insert Dropdown at the very top of space-y-2.5
            top_anchor = f'<div\n                  data-tour="{prefix}-message"\n                  className="scroll-mt-24 p-4 sm:p-5 space-y-3"\n                >\n                  <div className="space-y-2.5">'
            if top_anchor not in content:
                top_anchor = f'<div\n                      data-tour="{prefix}-message"\n                      className="scroll-mt-24 p-4 sm:p-5 space-y-3"\n                    >\n                      <div className="space-y-2.5">'
                
            if top_anchor in content:
                content = content.replace(top_anchor, top_anchor + "\n" + clean_dropdown_block + "\n")
        else:
            print("Toggle string not found")
    
    # Extract Inserter block
    inserter_start_str = '<div className="flex items-center justify-between pt-2 border-t border-neutral-800/60">'
    start_idx = content.find(inserter_start_str, content.find(f'data-setter="{prefix}Text"'))
    if start_idx != -1:
        # End is `0/2000 \n </span> \n </div>`
        end_match = re.search(r'0/2000\s*</span>\s*</div>', content[start_idx:])
        if end_match:
            end_idx = start_idx + end_match.end()
            inserter_block = content[start_idx:end_idx]
            content = content.replace(inserter_block, '')
            clean_inserter_block = inserter_block
            
            # Insert Inserter right after Footer
            footer_str = f'value={{{state_prefix}EmbedFooter}}'
            footer_idx = content.find(footer_str)
            if footer_idx != -1:
                # We find exactly `\n                  )}` or similar
                # Find the next `</div>` followed by `)}`
                end_footer_idx = content.find('</div>\n                  )}', footer_idx)
                if end_footer_idx != -1:
                    end_footer_idx += len('</div>\n                  )}')
                else:
                    end_footer_idx = content.find('</div>\n                    )}', footer_idx)
                    if end_footer_idx != -1:
                        end_footer_idx += len('</div>\n                    )}')
                    else:
                        end_footer_idx = content.find(')}', footer_idx + 100) + 2
                        
                content = content[:end_footer_idx] + "\n" + clean_inserter_block + "\n" + content[end_footer_idx:]
    
    return content

content = rearrange_blocks(content, "welcome", "welcome")
content = rearrange_blocks(content, "goodbye", "goodbye")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated UI layout safely.")
