utf-8import json
import pathlib
from typing import List

STORAGE_ROOT = pathlib.Path("Storage")

def _get_file_path(guild_id: int) -> pathlib.Path:
    folder = STORAGE_ROOT / str(guild_id)
    if not folder.exists():
        folder.mkdir(parents=True, exist_ok=True)
    return folder / "joinroles.json"

def load_join_roles(guild_id: int) -> List[int]:
    path = _get_file_path(guild_id)
    if not path.exists():
        return []
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data.get("roles", [])
    except Exception:
        return []

def save_join_roles(guild_id: int, roles: List[int]) -> None:
    path = _get_file_path(guild_id)
    with open(path, "w", encoding="utf-8") as f:
        json.dump({"roles": roles}, f, indent=4)

def add_join_role(guild_id: int, role_id: int) -> bool:
    roles = load_join_roles(guild_id)
    if role_id in roles:
        return False
    roles.append(role_id)
    save_join_roles(guild_id, roles)
    return True

def remove_join_role(guild_id: int, role_id: int) -> bool:
    roles = load_join_roles(guild_id)
    if role_id not in roles:
        return False
    roles.remove(role_id)
    save_join_roles(guild_id, roles)
    return True

def clear_join_roles(guild_id: int) -> int:
    roles = load_join_roles(guild_id)
    count = len(roles)
    if count > 0:
        save_join_roles(guild_id, [])
    return count
