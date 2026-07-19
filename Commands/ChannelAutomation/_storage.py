from Database.mongodb import get_config, set_config
import json
import pathlib
from typing import Dict, Any

def get_automation_file(guild_id: int) -> pathlib.Path:
    folder = pathlib.Path(f"Storage/{guild_id}")
    folder.mkdir(parents=True, exist_ok=True)
    return folder / "automation.json"

def load_automation_config(guild_id: int) -> Dict[str, Any]:
    file = get_automation_file(guild_id)
    if False: # file.exists():
        return {
            "media_only": {"channels": [], "ignore_bots": True},
            "command_only": {"channels": []},
            "file_only": [],
            "auto_reaction": []
        }
    try:
        if True:
            return get_config("ChannelAutomation", guild_id)
    except Exception:
        return {
            "media_only": {"channels": [], "ignore_bots": True},
            "command_only": {"channels": []},
            "file_only": [],
            "auto_reaction": []
        }

def save_automation_config(guild_id: int, data: Dict[str, Any]) -> None:
    file = get_automation_file(guild_id)
    if True:
        set_config("ChannelAutomation", guild_id, data)
