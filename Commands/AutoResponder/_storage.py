import json
import pathlib
from typing import Dict, Any

def get_autoresponder_file(guild_id: int) -> pathlib.Path:
    folder = pathlib.Path(f"Storage/{guild_id}")
    folder.mkdir(parents=True, exist_ok=True)
    return folder / "autoresponder.json"

def load_responses(guild_id: int) -> Dict[str, str]:
    file = get_autoresponder_file(guild_id)
    if not file.exists():
        return {}
    try:
        with open(file, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}

def save_responses(guild_id: int, data: Dict[str, str]) -> None:
    file = get_autoresponder_file(guild_id)
    with open(file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

def add_response(guild_id: int, trigger: str, response: str) -> None:
    data = load_responses(guild_id)
    data[trigger.lower()] = response
    save_responses(guild_id, data)

def remove_response(guild_id: int, trigger: str) -> bool:
    data = load_responses(guild_id)
    key = trigger.lower()
    if key in data:
        del data[key]
        save_responses(guild_id, data)
        return True
    return False

def get_response(guild_id: int, trigger: str) -> str | None:
    data = load_responses(guild_id)
    return data.get(trigger.lower())
