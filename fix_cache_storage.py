import re

files = {
    'Commands/Whitelist/_storage.py': 'Whitelist',
    'Commands/Blacklist/_storage.py': 'Blacklist',
    'Commands/Afk/_storage.py': 'Afk'
}

for file, col in files.items():
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    pattern = re.compile(
        r'if not path\.exists\(\):\s*_[a-z]+_cache\[guild_id\] = \{\}\s*return _[a-z]+_cache\[guild_id\]\s*try:\s*if True:\s*data = get_config\(\"[^\"]+\", guild_id\)\s*_[a-z]+_cache\[guild_id\] = data\s*return data\s*except Exception:'
    )
    
    def repl(m):
        cache_dict = file.split('/')[1].lower() + '_cache'
        return f'''try:
            data = get_config("{col}", guild_id)
            if not data:
                data = {{}}
            _{cache_dict}[guild_id] = data
            return data
        except Exception:'''
        
    new_content = pattern.sub(repl, content)
    with open(file, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f'Fixed {file}')
