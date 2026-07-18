import json
import pathlib
from typing import Dict, Any

def get_automation_file(guild_id: int) -> pathlib.Path:
    folder = pathlib.Path(f"Storage/{guild_id}")
    folder.mkdir(parents=True, exist_ok=True)
    return folder / "automation.json"

def load_automation_config(guild_id: int) -> Dict[str, Any]:
    file = get_automation_file(guild_id)
    if not file.exists():
        return {
            "media_only": {"channels": [], "ignore_bots": True},
            "command_only": {"channels": []},
            "file_only": [],
            "auto_reaction": []
        }
    try:
        with open(file, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {
            "media_only": {"channels": [], "ignore_bots": True},
            "command_only": {"channels": []},
            "file_only": [],
            "auto_reaction": []
        }

def save_automation_config(guild_id: int, data: Dict[str, Any]) -> None:
    file = get_automation_file(guild_id)
    with open(file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)
