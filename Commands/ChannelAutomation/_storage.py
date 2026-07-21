from Database.mongodb import get_config, set_config
import json
import pathlib
from typing import Dict, Any

def get_automation_file(guild_id: int) -> pathlib.Path:
    folder = pathlib.Path(f"Storage/{guild_id}")
    folder.mkdir(parents=True, exist_ok=True)
    return folder / "automation.json"

def load_automation_config(guild_id: int) -> Dict[str, Any]:
    default_cfg = {
        "media_only": {"channels": [], "ignore_bots": True},
        "command_only": {"channels": []},
        "file_only": [],
        "auto_reaction": [],
        "counting": {
            "enabled": False,
            "channel_id": "",
            "whitelisted_roles": [],
            "current_count": 0,
            "last_user_id": None
        }
    }
    try:
        cfg = get_config("ChannelAutomation", guild_id)
        if not cfg:
            return default_cfg
        for k, v in default_cfg.items():
            if k not in cfg:
                cfg[k] = v
        return cfg
    except Exception:
        return default_cfg

def save_automation_config(guild_id: int, data: Dict[str, Any]) -> None:
    file = get_automation_file(guild_id)
    if True:
        set_config("ChannelAutomation", guild_id, data)
