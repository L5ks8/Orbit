import re

replacements = {
    'Commands/Welcome/_storage.py': [
        (r'\"message\": \"Welcome \{user\} to \{server\}!\"', '\"message\": \"\"')
    ],
    'Commands/Goodbye/_storage.py': [
        (r'\"message\": \"We\'re sad to see you go, \{user\}!\"', '\"message\": \"\"')
    ],
    'Commands/Boost/_storage.py': [
        (r'\"message\": \"Thank you for boosting the server, \{user\}!\"', '\"message\": \"\"')
    ],
    'Commands/Ticket/_storage.py': [
        (r'\"panel_title\": \"Support Ticket Desk\"', '\"panel_title\": \"\"'),
        (r'\"panel_description\": \"Click the button below to open a direct support channel with our team\.\"', '\"panel_description\": \"\"'),
        (r'\"panel_instructions\": \"> Select your desired inquiry category in the dropdown menu below, then click \*\*Create Ticket\*\* to open your private channel\.\"', '\"panel_instructions\": \"\"')
    ],
    'Commands/Level/_storage.py': [
        (r'\"levelup_message_content\": \"\{user_mention\}\"', '\"levelup_message_content\": \"\"'),
        (r'\"levelup_embed_title\": \"🎉 Level Up!\"', '\"levelup_embed_title\": \"\"'),
        (r'\"levelup_embed_description\": \"Congratulations \*\*\{user_globalname\}\*\*\!\\nYou reached \*\*Level \{level\}\*\*\.\"', '\"levelup_embed_description\": \"\"')
    ]
}

for file, changes in replacements.items():
    try:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        for old, new in changes:
            content = re.sub(old, new, content)
            
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file}")
    except Exception as e:
        print(f"Failed to update {file}: {e}")

