import sys
import re

try:
    with open('Website/frontend/src/components/dashboard/Moderation.jsx', 'r', encoding='utf-8') as f:
        code = f.read()

    # 1. Add logs state
    state_decl = """  const [exemptions, setExemptions] = useState({ roles: [], channels: [] });
  const [logs, setLogs] = useState({
    enabled: true,
    executor_in_logs: false,
    global_exempt_channels: [],
    global_exempt_roles: [],
    categories: {},
    channels: {},
    roles: {}
  });"""
    code = code.replace("  const [exemptions, setExemptions] = useState({ roles: [], channels: [] });", state_decl)

    # 2. Add logs to getPayload
    payload_logic = """      automod: {
        enabled: serverData?.config?.automod?.enabled ?? true,
        exempt_channels: exemptions.channels,
        exempt_roles: exemptions.roles,
        banned_words: { ...bannedWords },
        anti_spam: { ...antiSpam },
        anti_link: { ...antiLink },
        anti_invites: { ...antiInvites },
        mention_spam: { ...mentionSpam },
        anti_zalgo: { ...antiZalgo },
        anti_caps: { ...antiCaps }
      },
      logs: {
        ...logs
      }"""
    
    code = re.sub(
        r'automod:\s*\{[^}]*?anti_caps:\s*\{\s*\.\.\.antiCaps\s*\}[^}]*?\}',
        payload_logic,
        code
    )

    # 3. Load logs from serverData inside the useEffect block
    load_logic = """        setExemptions({
          roles: amCfg.exempt_roles || [],
          channels: amCfg.exempt_channels || []
        });

        const lCfg = serverData.config?.logs || {};
        setLogs({
          enabled: lCfg.enabled ?? true,
          executor_in_logs: lCfg.executor_in_logs || false,
          global_exempt_channels: lCfg.global_exempt_channels || [],
          global_exempt_roles: lCfg.global_exempt_roles || [],
          categories: lCfg.categories || {},
          channels: lCfg.channels || {},
          roles: lCfg.roles || {}
        });"""
    
    code = code.replace("""        setExemptions({
          roles: amCfg.exempt_roles || [],
          channels: amCfg.exempt_channels || []
        });""", load_logic)
        
    with open('Website/frontend/src/components/dashboard/Moderation.jsx', 'w', encoding='utf-8') as f:
        f.write(code)
    print('Updated state in Moderation.jsx')
except Exception as e:
    print('Failed:', e)
