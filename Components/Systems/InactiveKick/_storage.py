from Components.Database.mongodb import get_config, set_config
from typing import Dict, Any

DEFAULT_INACTIVE_KICK_CONFIG = {
    "enabled": False,
    "days": 30,
    "action": "kick",  # "kick", "timeout", "prune"
    "min_server_size": 10,
    "log_channel_id": None,
    "historical_tracking": False,
    "exempt_roles": [],
    "ignore_any_role": False,
    "count_voice": True,
    "dm_warning_enabled": True,
    "warn_before_hours": 24,
    "warning_message": "Hey {user}! You've been inactive in **{server}** for {days} days. You'll be removed in {hours} hours unless you send a message or join a voice channel."
}

def load_inactive_kick_config(guild_id: int) -> Dict[str, Any]:
    cfg = DEFAULT_INACTIVE_KICK_CONFIG.copy()
    try:
        data = get_config("InactiveKick", guild_id)
        if data and isinstance(data, dict):
            for k, v in DEFAULT_INACTIVE_KICK_CONFIG.items():
                if k in data:
                    cfg[k] = data[k]
    except Exception as e:
        print(f"[InactiveKick] Error loading config for {guild_id}: {e}")
    return cfg

def save_inactive_kick_config(guild_id: int, cfg: Dict[str, Any]) -> bool:
    try:
        clean_cfg = {}
        for k, default_val in DEFAULT_INACTIVE_KICK_CONFIG.items():
            if k in cfg:
                val = cfg[k]
                if k == "days":
                    try:
                        clean_cfg[k] = max(1, min(365, int(val)))
                    except Exception:
                        clean_cfg[k] = 30
                elif k == "warn_before_hours":
                    try:
                        clean_cfg[k] = max(1, min(168, int(val)))
                    except Exception:
                        clean_cfg[k] = 24
                elif k == "min_server_size":
                    try:
                        clean_cfg[k] = max(0, int(val))
                    except Exception:
                        clean_cfg[k] = 10
                elif k in ("enabled", "historical_tracking", "ignore_any_role", "count_voice", "dm_warning_enabled"):
                    clean_cfg[k] = bool(val)
                elif k == "exempt_roles":
                    clean_cfg[k] = [str(r) for r in val if str(r).strip()] if isinstance(val, list) else []
                elif k == "log_channel_id":
                    clean_cfg[k] = str(val) if val else None
                elif k in ("action", "warning_message"):
                    clean_cfg[k] = str(val)
                else:
                    clean_cfg[k] = val
            else:
                clean_cfg[k] = default_val

        set_config("InactiveKick", guild_id, clean_cfg)
        return True
    except Exception as e:
        print(f"[InactiveKick] Error saving config for {guild_id}: {e}")
        return False
