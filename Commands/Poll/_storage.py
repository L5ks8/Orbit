import json
import pathlib
import random
import string
from typing import Dict, Any

STORAGE_ROOT = pathlib.Path("Storage")

def _get_file_path(guild_id: int) -> pathlib.Path:
    folder = STORAGE_ROOT / str(guild_id)
    if not folder.exists():
        folder.mkdir(parents=True, exist_ok=True)
    return folder / "polls.json"

def load_polls(guild_id: int) -> Dict[str, Dict[str, Any]]:
    path = _get_file_path(guild_id)
    if not path.exists():
        return {}
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}

def save_polls(guild_id: int, data: Dict[str, Dict[str, Any]]) -> None:
    path = _get_file_path(guild_id)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

def generate_poll_id(guild_id: int) -> str:
    data = load_polls(guild_id)
    while True:
        pid = "P-" + "".join(random.choices(string.digits, k=6))
        if pid not in data:
            return pid

def create_poll_entry(guild_id: int, poll_id: str, channel_id: int, message_id: int, question: str, options: list[str], author_id: int) -> None:
    data = load_polls(guild_id)
    data[poll_id] = {
        "channel_id": channel_id,
        "message_id": message_id,
        "question": question,
        "options": options,
        "author_id": author_id,
        "closed": False
    }
    save_polls(guild_id, data)

def get_poll_entry(guild_id: int, poll_id: str) -> Dict[str, Any] | None:
    data = load_polls(guild_id)
    pid_clean = poll_id.strip().upper()
    if not pid_clean.startswith("P-"):
        if f"P-{pid_clean}" in data:
            return data[f"P-{pid_clean}"]
    return data.get(pid_clean)

def close_poll_entry(guild_id: int, poll_id: str) -> bool:
    data = load_polls(guild_id)
    pid_clean = poll_id.strip().upper()
    if not pid_clean.startswith("P-"):
        if f"P-{pid_clean}" in data:
            pid_clean = f"P-{pid_clean}"
            
    if pid_clean not in data:
        return False
    data[pid_clean]["closed"] = True
    save_polls(guild_id, data)
    return True

