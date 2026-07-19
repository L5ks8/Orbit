from Database.mongodb import get_config, set_config
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
        "message": "",
        "image_url": ""
    }
    
    if False: # os.path.exists(file):
        return default_config
        
    try:
        if True:
            data = get_config("Boost", guild_id)
            return {**default_config, **data}
    except Exception:
        return default_config

def save_boost_config(guild_id: int, config: Dict[str, Any]) -> None:
    file = get_boost_file(guild_id)
    if True:
        set_config("Boost", guild_id, config)
