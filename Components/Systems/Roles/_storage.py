from Components.Database.mongodb import get_config, set_config
import threading
from typing import Dict, Any

_joinrole_cache: Dict[int, Dict[str, Any]] = {}
_joinrole_lock = threading.Lock()

DEFAULT_JOINROLE_CONFIG = {
    "enabled": False,
    "user_roles_enabled": False,
    "user_roles": [],
    "bot_roles_enabled": False,
    "bot_roles": [],
    "tag_roles_enabled": False,
    "tag_role": None
}


def load_join_roles(guild_id: int) -> Dict[str, Any]:
    """Load join role configuration for a guild from MongoDB."""
    with _joinrole_lock:
        try:
            data = get_config("JoinRole", guild_id)
            if not data:
                cfg = dict(DEFAULT_JOINROLE_CONFIG)
                _joinrole_cache[guild_id] = cfg
                return cfg

            # Migration: old format had "roles" instead of "user_roles"
            if "roles" in data and "user_roles" not in data:
                migrated = {
                    "enabled": True,
                    "user_roles_enabled": True,
                    "user_roles": data.get("roles", []),
                    "bot_roles_enabled": False,
                    "bot_roles": [],
                    "tag_roles_enabled": False,
                    "tag_role": None
                }
                _joinrole_cache[guild_id] = migrated
                return migrated

            # Ensure all keys exist with defaults
            cfg = {
                "enabled": data.get("enabled", False),
                "user_roles_enabled": data.get("user_roles_enabled", False),
                "user_roles": data.get("user_roles", []),
                "bot_roles_enabled": data.get("bot_roles_enabled", False),
                "bot_roles": data.get("bot_roles", []),
                "tag_roles_enabled": data.get("tag_roles_enabled", False),
                "tag_role": data.get("tag_role", None)
            }
            _joinrole_cache[guild_id] = cfg
            return cfg
        except Exception:
            cfg = dict(DEFAULT_JOINROLE_CONFIG)
            _joinrole_cache[guild_id] = cfg
            return cfg


def save_join_roles(guild_id: int, data: Dict[str, Any]) -> None:
    """Save join role configuration for a guild to MongoDB."""
    with _joinrole_lock:
        _joinrole_cache[guild_id] = data
        set_config("JoinRole", guild_id, data)


def add_join_role(guild_id: int, role_id: int) -> bool:
    """Add a role to user_roles. Returns True if added, False if already present."""
    data = load_join_roles(guild_id)
    if role_id not in data["user_roles"]:
        data["user_roles"].append(role_id)
        save_join_roles(guild_id, data)
        return True
    return False


def remove_join_role(guild_id: int, role_id: int) -> bool:
    """Remove a role from user_roles. Returns True if removed, False if not found."""
    data = load_join_roles(guild_id)
    if role_id in data["user_roles"]:
        data["user_roles"].remove(role_id)
        save_join_roles(guild_id, data)
        return True
    return False


def clear_join_roles(guild_id: int) -> bool:
    """Clear all user_roles. Returns True if there were roles to clear."""
    data = load_join_roles(guild_id)
    if len(data["user_roles"]) > 0:
        data["user_roles"] = []
        save_join_roles(guild_id, data)
        return True
    return False
