import os
import glob
import re

files = glob.glob('Commands/**/_storage.py', recursive=True)
for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    pattern = re.compile(
        r'if not path\.exists\(\):\s*data = ([a-zA-Z0-9_]+)\.copy\(\)\s*else:\s*try:\s*if True:\s*data = get_config\("([^"]+)", guild_id\)\s*except Exception:\s*data = \1\.copy\(\)'
    )
    
    def repl(m):
        var_name = m.group(1)
        col = m.group(2)
        return f'try:\n        data = get_config("{col}", guild_id)\n        if not data:\n            data = {var_name}.copy()\n    except Exception:\n        data = {var_name}.copy()'
    
    new_content = pattern.sub(repl, content)
    
    if new_content != content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Updated {file}')
    else:
        print(f'No match found in {file}')
