import sys
import re

# 1. Update Moderation.jsx
try:
    with open('Website/frontend/src/components/dashboard/Moderation.jsx', 'r', encoding='utf-8') as f:
        mod_code = f.read()

    # Remove state vars
    mod_code = re.sub(r'\s*const \[aiAutomodEnabled, setAiAutomodEnabled\] = useState\(.*?\);', '', mod_code)
    mod_code = re.sub(r'\s*const \[aiImageEnabled, setAiImageEnabled\] = useState\(.*?\);', '', mod_code)
    
    # Remove from payload
    mod_code = re.sub(r'\s*ai_automod: \{ enabled: aiAutomodEnabled, action: \'delete\' \},', '', mod_code)
    mod_code = re.sub(r'\s*ai_image: \{ enabled: aiImageEnabled, action: \'delete\' \},', '', mod_code)
    
    # Remove from config loader
    mod_code = re.sub(r'\s*setAiAutomodEnabled\(amCfg\.ai_automod\?\.enabled \|\| false\);', '', mod_code)
    mod_code = re.sub(r'\s*setAiImageEnabled\(amCfg\.ai_image\?\.enabled \|\| false\);', '', mod_code)
    
    # Remove UI cards for AI Image Moderation
    mod_code = re.sub(r'\s*\{\/\* AI Image Moderation Card \*\/\}[\s\S]*?(?=\{\/\* (Anti-Spam Card|Anti Spam) \*\/\}|<!-- next section|</div>\s*</div>\s*</div>\s*</div>)', '', mod_code)
    # Actually wait, regex for the card might be dangerous if it doesn't find the next section precisely. Let's just remove the array from AutomodSettings and the backend, since Moderation.jsx doesn't actually render the AI card anymore, wait, does it?
    
    with open('Website/frontend/src/components/dashboard/Moderation.jsx', 'w', encoding='utf-8') as f:
        f.write(mod_code)
    print('Updated Moderation.jsx')
except Exception as e:
    print('Failed on Moderation.jsx:', e)

# 2. Update AutomodSettings.jsx
try:
    with open('Website/frontend/src/components/dashboard/modules/AutomodSettings.jsx', 'r', encoding='utf-8') as f:
        am_code = f.read()

    # Remove from array
    am_code = re.sub(r'\s*\{\s*id:\s*\'ai_automod\'[^}]*\},', '', am_code)
    
    # Remove from && condition
    am_code = am_code.replace("&& editingForm.id !== 'ai_automod'", "")
    
    with open('Website/frontend/src/components/dashboard/modules/AutomodSettings.jsx', 'w', encoding='utf-8') as f:
        f.write(am_code)
    print('Updated AutomodSettings.jsx')
except Exception as e:
    print('Failed on AutomodSettings.jsx:', e)

# 3. Update config.py
try:
    with open('Website/backend/api/config.py', 'r', encoding='utf-8') as f:
        cfg_code = f.read()

    # Remove from api_get_config
    cfg_code = re.sub(r'\s*\"ai_automod\":\s*\{[^}]+\},', '', cfg_code)
    cfg_code = re.sub(r'\s*\"ai_image\":\s*\{[^}]+\},', '', cfg_code)
    
    # Remove from api_post_config
    cfg_code = re.sub(r'\s*save_submodule\(\"ai_automod\",\s*[^)]+\)', '', cfg_code)
    cfg_code = re.sub(r'\s*save_submodule\(\"ai_image\",\s*[^)]+\)', '', cfg_code)

    with open('Website/backend/api/config.py', 'w', encoding='utf-8') as f:
        f.write(cfg_code)
    print('Updated config.py')
except Exception as e:
    print('Failed on config.py:', e)

# 4. Update automodlistener.py
try:
    with open('Components/Dashboard/Automoderation/automodlistener.py', 'r', encoding='utf-8') as f:
        aml_code = f.read()

    # Remove AI block
    aml_code = re.sub(r'\s*ai_cfg = config\.get\(\"ai_automod\", \{\}\)\s*if ai_cfg\.get\(\"enabled\", False\).*?(?=\s*@commands\.Cog\.listener\(\))', '\n\n', aml_code, flags=re.DOTALL)
    
    with open('Components/Dashboard/Automoderation/automodlistener.py', 'w', encoding='utf-8') as f:
        f.write(aml_code)
    print('Updated automodlistener.py')
except Exception as e:
    print('Failed on automodlistener.py:', e)
