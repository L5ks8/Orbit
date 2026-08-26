from Components.Database.mongodb import get_config, set_config
from typing import Dict, Any

def load_security_config(guild_id: int) -> Dict[str, Any]:
    default_cfg = {
        "anti_nuke": {
            "enabled": False,
            "test_mode": False,
            "privilege_escalation": False,
            "webhook_firewall": False,
            "server_identity": False,
            "block_unknown_bot": False,
            "level": "recommended",
            "exempt_users": "",
            "exempt_roles": [],
            "permissions_granted_watch": [],
            "permissions_removed_watch": [],
            "mass_emoji_threshold": 10
        },
        "anti_raid": {
            "enabled": False,
            "verification_challenge": False,
            "suspicious_account": False,
            "no_profile_picture": False,
            "default_username": False,
            "suspicious_account_age": "14d",
            "suspicious_action": "flag",
            "suspicious_alert_channel": None,
            "join_threshold": 5,
            "join_time_window": "10s",
            "action": "timeout",
            "young_account_cutoff": "14d",
            "auto_unlock_after": "1h",
            "immune_users": "",
            "immune_roles": [],
            "alert_channel": None,
            "level": "balanced"
        },
        "webhook_protection": {
            "enabled": False,
            "block_everyone": False,
            "block_invite_links": False,
            "rate_limit": 5,
            "action": "delete",
            "trusted_webhooks": ""
        }
    }
    try:
        data = get_config("Security", guild_id)
        if not data:
            data = default_cfg.copy()
    except Exception:
        data = default_cfg.copy()

    # Deep merge defaults
    for key, val in default_cfg.items():
        if key not in data:
            data[key] = val
        elif isinstance(val, dict) and isinstance(data[key], dict):
            for sub_key, sub_val in val.items():
                if sub_key not in data[key]:
                    data[key][sub_key] = sub_val
            
    return data

def save_security_config(guild_id: int, config: Dict[str, Any]) -> None:
    set_config("Security", guild_id, config)

def log_threat(guild_id: int, threat_type: str, message: str) -> None:
    import time
    config = load_security_config(guild_id)
    if "threat_logs" not in config:
        config["threat_logs"] = []
    
    config["threat_logs"].insert(0, {
        "timestamp": time.time(),
        "type": threat_type,
        "message": message
    })
    
    # Keep only last 50 logs
    config["threat_logs"] = config["threat_logs"][:50]
    save_security_config(guild_id, config)
