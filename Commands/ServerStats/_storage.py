import os
import json

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "serverstats")

def ensure_data_dir():
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR, exist_ok=True)

def get_config_path(guild_id: int) -> str:
    ensure_data_dir()
    return os.path.join(DATA_DIR, f"{guild_id}.json")

def get_default_serverstats_config() -> dict:
    return {
        "enabled": False,
        "category_id": "",
        "category_name": "📊 SERVER STATS 📊",
        "channels": {
            "members": {
                "enabled": True,
                "channel_id": "",
                "format": "👥 | Members: {count}"
            },
            "humans": {
                "enabled": False,
                "channel_id": "",
                "format": "👥 | Humans: {humans}"
            },
            "bots": {
                "enabled": False,
                "channel_id": "",
                "format": "🤖 | Bots: {bots}"
            },
            "boosts": {
                "enabled": False,
                "channel_id": "",
                "format": "🚀 | Boosts: {boosts}"
            },
            "voice_users": {
                "enabled": False,
                "channel_id": "",
                "format": "🎙️ | In Voice: {voice_users}"
            }
        }
    }

def load_serverstats_config(guild_id: int) -> dict:
    path = get_config_path(guild_id)
    default_cfg = get_default_serverstats_config()
    if not os.path.exists(path):
        return default_cfg
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            # Merge with defaults
            merged = default_cfg.copy()
            merged["enabled"] = data.get("enabled", False)
            merged["category_id"] = str(data.get("category_id", ""))
            merged["category_name"] = data.get("category_name", "📊 SERVER STATS 📊")
            
            channels_data = data.get("channels", {})
            for key, default_ch in default_cfg["channels"].items():
                ch_val = channels_data.get(key, {})
                merged["channels"][key] = {
                    "enabled": ch_val.get("enabled", default_ch["enabled"]),
                    "channel_id": str(ch_val.get("channel_id", "")),
                    "format": ch_val.get("format", default_ch["format"])
                }
            return merged
    except Exception as e:
        print(f"[ServerStats] Error loading config for {guild_id}: {e}")
        return default_cfg

def save_serverstats_config(guild_id: int, data: dict):
    path = get_config_path(guild_id)
    current = load_serverstats_config(guild_id)

    if "enabled" in data:
        current["enabled"] = bool(data["enabled"])

    cat_id = data.get("category_id")
    if cat_id is not None:
        current["category_id"] = str(cat_id).strip()
    
    cat_name = data.get("category_name")
    if cat_name is not None and str(cat_name).strip():
        current["category_name"] = str(cat_name).strip()

    incoming_channels = data.get("channels", {})
    if isinstance(incoming_channels, dict):
        for key, incoming_ch in incoming_channels.items():
            if not isinstance(incoming_ch, dict):
                continue
            if key not in current["channels"]:
                current["channels"][key] = {
                    "enabled": False,
                    "channel_id": "",
                    "format": ""
                }
            if "enabled" in incoming_ch:
                current["channels"][key]["enabled"] = bool(incoming_ch["enabled"])
            if "format" in incoming_ch:
                current["channels"][key]["format"] = str(incoming_ch["format"])
            # Preserve existing channel_id if not explicitly provided or if empty in incoming data
            inc_ch_id = incoming_ch.get("channel_id")
            if inc_ch_id is not None and str(inc_ch_id).strip():
                current["channels"][key]["channel_id"] = str(inc_ch_id).strip()

    try:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(current, f, indent=4, ensure_ascii=False)
    except Exception as e:
        print(f"[ServerStats] Error saving config for {guild_id}: {e}")
