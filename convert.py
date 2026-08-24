import re
import json

with open('html.txt', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace basic properties
html = html.replace('class=', 'className=')
html = html.replace('stroke-width=', 'strokeWidth=')
html = html.replace('stroke-linecap=', 'strokeLinecap=')
html = html.replace('stroke-linejoin=', 'strokeLinejoin=')
html = html.replace('for=', 'htmlFor=')
html = html.replace('tabindex=', 'tabIndex=')
html = html.replace('disabled=""', 'disabled={true}')
html = html.replace('aria-checked="true"', 'aria-checked={true}')
html = html.replace('aria-checked="false"', 'aria-checked={false}')

# Fix self-closing tags
def fix_self_closing(tag):
    global html
    # First remove closing tags
    html = html.replace(f'</{tag}>', '')
    
    # We want to match <tag ... > and replace with <tag ... />
    # But some might be <tag ... /> or <tag .../ > already.
    # Let's match the inside of the tag:
    def replacer(m):
        inside = m.group(1)
        # remove any trailing slashes from the inside
        inside = inside.rstrip(' /')
        return f'<{tag}{inside} />'

    html = re.sub(fr'<{tag}([^>]*?)>', replacer, html)

for tag in ['rect', 'circle', 'line', 'path', 'input', 'img', 'br', 'hr']:
    fix_self_closing(tag)

# Fix styles manually, they are short enough to use regex for basic key/val
def replace_style(match):
    styles = match.group(1).split(';')
    obj = {}
    for s in styles:
        s = s.strip()
        if not s: continue
        if ':' not in s: continue
        k, v = s.split(':', 1)
        k = k.strip()
        v = v.strip()
        # kebab-case to camelCase
        k = re.sub(r'-([a-z])', lambda m: m.group(1).upper(), k)
        obj[k] = v
    return 'style={{' + ', '.join([f'"{k}": "{v}"' for k,v in obj.items()]) + '}}'

html = re.sub(r'style="([^"]*)"', replace_style, html)

# Wrap it in a component
comp = f"""import React, {{ useState, useEffect }} from 'react';
import {{ useToast }} from '../ui/Toast';
import {{ useParams }} from 'react-router-dom';

export default function Invites() {{
  const {{ guildId }} = useParams();
  const toast = useToast();
  
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSave = () => {{
    const toastId = toast.loading('Saving...');
    setIsSaving(true);
    setTimeout(() => {{
      toast.success('Settings saved', {{ id: toastId }});
      setIsSaving(false);
    }}, 1000);
  }};

  return (
    {html}
  );
}}
"""

with open('Website/frontend/src/components/dashboard/Invites.jsx', 'w', encoding='utf-8') as f:
    f.write(comp)
