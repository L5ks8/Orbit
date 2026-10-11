from Components.Database.mongodb import get_config, set_config
import os
import json
import pathlib
from typing import Dict, Any, Optional

WEB_VERIFY_SESSIONS = {}

STORAGE_ROOT = pathlib.Path("Storage")

def _get_file_path(guild_id: int) -> pathlib.Path:
    folder = STORAGE_ROOT / str(guild_id)
    if not folder.exists():
        folder.mkdir(parents=True, exist_ok=True)
    return folder / "verify.json"

DEFAULT_VERIFY_TITLE = "Server Verification"
DEFAULT_VERIFY_DESC = "Please click the button below to verify your account and gain access to the server."
DEFAULT_VERIFY_IMAGE = "/img/default_verify.png"
DEFAULT_VERIFY_COLOR = "#5865F2"

def load_verify_config(guild_id: int) -> Dict[str, Any]:
    path = _get_file_path(guild_id)
    default_cfg = {
        "enabled": False, 
        "channel_id": None, 
        "role_id": None, 
        "remove_role_id": None, 
        "verification_type": "captcha", 
        "timeout_action": "none",
        "timeout_minutes": 0,
        "auto_kick_minutes": 0, 
        "pending_kicks": {},
        "embed_title": DEFAULT_VERIFY_TITLE,
        "embed_description": DEFAULT_VERIFY_DESC,
        "embed_image": DEFAULT_VERIFY_IMAGE,
        "embed_color": DEFAULT_VERIFY_COLOR,
        "embed_fields": [],
        "verified_ips": []
    }
    
    try:
        data = get_config("Verify", guild_id, default_cfg)
        merged = {**default_cfg, **(data or {})}
    except Exception:
        merged = default_cfg.copy()

    if not isinstance(merged, dict):
        merged = default_cfg.copy()

    if "verified_ips" not in merged:
        merged["verified_ips"] = []
    if "enabled" not in merged:
        merged["enabled"] = bool(merged.get("channel_id") and merged.get("role_id"))
    if "pending_kicks" not in merged or not isinstance(merged["pending_kicks"], dict):
        merged["pending_kicks"] = {}
    if "remove_role_id" not in merged:
        merged["remove_role_id"] = None
    if not merged.get("verification_type"):
        merged["verification_type"] = "captcha"
    if not merged.get("timeout_action"):
        merged["timeout_action"] = "none"
    if not merged.get("embed_title"):
        merged["embed_title"] = DEFAULT_VERIFY_TITLE
    if not merged.get("embed_description"):
        merged["embed_description"] = DEFAULT_VERIFY_DESC
    if not merged.get("embed_image") or "Web/static/default_verify.png" in str(merged.get("embed_image", "")):
        merged["embed_image"] = DEFAULT_VERIFY_IMAGE
    if not merged.get("embed_color"):
        merged["embed_color"] = DEFAULT_VERIFY_COLOR
    if not isinstance(merged.get("embed_fields"), list):
        merged["embed_fields"] = []
        
    return merged

def save_verify_config(guild_id: int, config: Dict[str, Any]) -> None:
    path = _get_file_path(guild_id)
    if True:
        set_config("Verify", guild_id, config)

def setup_verify_config(guild_id: int, channel_id: int, role_id: int, remove_role_id: Optional[int] = None, verification_type: str = "captcha", auto_kick_minutes: int = 0) -> Dict[str, Any]:
    config = load_verify_config(guild_id)
    config["enabled"] = True
    config["channel_id"] = channel_id
    config["role_id"] = role_id
    config["remove_role_id"] = remove_role_id
    config["verification_type"] = verification_type
    config["auto_kick_minutes"] = max(0, auto_kick_minutes)
    save_verify_config(guild_id, config)
    return config

def toggle_verify_config(guild_id: int) -> Dict[str, Any]:
    config = load_verify_config(guild_id)
    config["enabled"] = not config.get("enabled", False)
    save_verify_config(guild_id, config)
    return config

def reset_verify_config(guild_id: int) -> Dict[str, Any]:
    config = {
        "enabled": False,
        "channel_id": None,
        "role_id": None,
        "remove_role_id": None,
        "verification_type": "captcha",
        "auto_kick_minutes": 0,
        "pending_kicks": {}
    }
    save_verify_config(guild_id, config)
    return config

def add_pending_kick(guild_id: int, user_id: int, kick_timestamp: float) -> None:
    config = load_verify_config(guild_id)
    config["pending_kicks"][str(user_id)] = kick_timestamp
    save_verify_config(guild_id, config)

def remove_pending_kick(guild_id: int, user_id: int) -> None:
    config = load_verify_config(guild_id)
    if str(user_id) in config.get("pending_kicks", {}):
        del config["pending_kicks"][str(user_id)]
        save_verify_config(guild_id, config)

