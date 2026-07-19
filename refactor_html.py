import os

with open('Web/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

os.makedirs('Web/components/tabs', exist_ok=True)
os.makedirs('Web/components/layout', exist_ok=True)

def extract_div_by_id(html_content, div_id, filepath):
    start_tag = f'<div id="{div_id}"'
    if start_tag not in html_content:
        # try class
        start_tag = f'<div class="{div_id}"'
        if start_tag not in html_content:
            return html_content
    
    start_idx = html_content.find(start_tag)
    
    # Simple nested div parser
    depth = 0
    i = start_idx
    end_idx = -1
    
    while i < len(html_content):
        if html_content[i:i+4] == '<div':
            depth += 1
            i += 4
        elif html_content[i:i+6] == '</div>':
            depth -= 1
            i += 6
            if depth == 0:
                end_idx = i
                break
        else:
            i += 1
            
    if end_idx == -1: return html_content
    
    component = html_content[start_idx:end_idx]
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(component)
        
    rel_path = filepath.replace('Web/', '').replace('\\', '/')
    replacement = f'<!-- INCLUDE {rel_path} -->'
    
    return html_content[:start_idx] + replacement + html_content[end_idx:]

html = extract_div_by_id(html, 'dash-sidebar', 'Web/components/layout/sidebar.html')
html = extract_div_by_id(html, 'dash-topbar', 'Web/components/layout/topbar.html')

html = extract_div_by_id(html, 'section-overview', 'Web/components/tabs/overview.html')
html = extract_div_by_id(html, 'section-settings', 'Web/components/tabs/settings.html')
html = extract_div_by_id(html, 'section-automod', 'Web/components/tabs/automod.html')
html = extract_div_by_id(html, 'section-level', 'Web/components/tabs/leveling.html')
html = extract_div_by_id(html, 'section-ticket', 'Web/components/tabs/tickets.html')
html = extract_div_by_id(html, 'section-automation', 'Web/components/tabs/automation.html')
html = extract_div_by_id(html, 'section-logs', 'Web/components/tabs/logs.html')

with open('Web/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print('HTML components extracted successfully.')
