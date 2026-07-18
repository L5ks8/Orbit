import json
import os
from typing import Dict, Any

def get_boost_file(guild_id: int) -> str:
    folder = f"Data/{guild_id}"
    if not os.path.exists(folder):
        os.makedirs(folder)
    return f"{folder}/boost.json"

def load_boost_config(guild_id: int) -> Dict[str, Any]:
    file = get_boost_file(guild_id)
    default_config = {
        "enabled": False,
        "channel_id": "",
        "message": "Thank you for boosting the server, {user}!",
        "image_url": ""
    }
    
    if not os.path.exists(file):
        return default_config
        
    try:
        with open(file, "r", encoding="utf-8") as f:
            data = json.load(f)
            return {**default_config, **data}
    except Exception:
        return default_config

def save_boost_config(guild_id: int, config: Dict[str, Any]) -> None:
    file = get_boost_file(guild_id)
    with open(file, "w", encoding="utf-8") as f:
        json.dump(config, f, indent=4)
