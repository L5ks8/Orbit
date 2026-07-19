import re
with open('Web/static/script.js', 'r', encoding='utf-8') as f:
    js = f.read()

replacements = [
    (r"config\.welcome\?\.message \|\| 'Welcome \{user\} to \{server\}!'", "config.welcome?.message || ''"),
    (r'config\.goodbye\?\.message \|\| "We\'re sad to see you go, \{user\}!"', "config.goodbye?.message || ''"),
    (r"config\.boost\?\.message \|\| 'Thank you for boosting the server, \{user\}!'", "config.boost?.message || ''"),
    (r"config\.ticket\?\.panel_title \|\| 'Support Ticket Desk'", "config.ticket?.panel_title || ''"),
    (r"config\.ticket\?\.panel_description \|\| 'Click the button below to open a direct support channel with our team.'", "config.ticket?.panel_description || ''"),
    (r"config\.ticket\?\.panel_instructions \|\| '> Select your desired inquiry category in the dropdown menu below, then click \*\*Create Ticket\*\* to open your private channel.'", "config.ticket?.panel_instructions || ''"),
    (r"config\.level\?\.levelup_message_content \|\| '\{user_mention\}'", "config.level?.levelup_message_content || ''"),
    (r"config\.level\?\.levelup_embed_title \|\| '🎉 Level Up!'", "config.level?.levelup_embed_title || ''"),
    (r"config\.level\?\.levelup_embed_description \|\| 'Congratulations \*\*\{user_globalname\}\*\*!\\nYou reached \*\*Level \{level\}\*\*.'", "config.level?.levelup_embed_description || ''")
]

for old, new in replacements:
    js = re.sub(old, new, js)

with open('Web/static/script.js', 'w', encoding='utf-8') as f:
    f.write(js)
print('Replaced fallbacks in script.js')
