from Components.Database.mongodb import get_config, set_config
from typing import Dict, Any

def load_security_config(guild_id: int) -> Dict[str, Any]:
    default_cfg = {
        "anti_nuke_enabled": True,
        "anti_scam_enabled": True,
        "anti_nuke_threshold": 3,
        "anti_nuke_time_window": 10
    }
    try:
        data = get_config("Security", guild_id)
        if not data:
            data = default_cfg.copy()
    except Exception:
        data = default_cfg.copy()

    for k, v in default_cfg.items():
        if k not in data:
            data[k] = v
            
    return data

def save_security_config(guild_id: int, config: Dict[str, Any]) -> None:
    set_config("Security", guild_id, config)
