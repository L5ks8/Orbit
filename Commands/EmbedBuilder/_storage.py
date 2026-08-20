import json
import os
import secrets
import pathlib
from typing import Dict, Any

STORAGE_ROOT = pathlib.Path("Storage")

def _get_embedbuilder_path(guild_id: int) -> str:
    path = STORAGE_ROOT / str(guild_id) / "embedbuilder"
    path.mkdir(parents=True, exist_ok=True)
    return str(path / "embeds.json")

def load_embeds_config(guild_id: int) -> Dict[str, Any]:
    file_path = _get_embedbuilder_path(guild_id)
    if not os.path.exists(file_path):
        return {"embeds": []}
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except:
        return {"embeds": []}

def save_embeds_config(guild_id: int, data: Dict[str, Any]):
    file_path = _get_embedbuilder_path(guild_id)
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)
