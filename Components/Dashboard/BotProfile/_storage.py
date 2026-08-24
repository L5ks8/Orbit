from typing import Dict, Any
from Components.Database.mongodb import get_config, set_config

def load_botprofile_config(guild_id: int) -> Dict[str, Any]:
    default = {
        "nickname": "",
        "avatar_url": "",
        "banner_url": "",
        "bio": ""
    }
    try:
        data = get_config("BotProfile", guild_id)
        if not data:
            return default.copy()
        
        # Merge with default to ensure keys exist
        merged = default.copy()
        for k in default.keys():
            if k in data:
                merged[k] = data[k]
        return merged
    except Exception:
        return default.copy()

def save_botprofile_config(guild_id: int, config: Dict[str, Any]) -> None:
    set_config("BotProfile", guild_id, config)
