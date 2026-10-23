import json
import os
from Components.Database.mongodb import get_config, set_config

DATA_DIR = os.path.join("Components/Database", "WebDashboard")

def _get_path(guild_id):
    os.makedirs(DATA_DIR, exist_ok=True)
    return os.path.join(DATA_DIR, f"{guild_id}.json")

def load_settings_config(guild_id):
    try:
        data = get_config("WebDashboardSettings", int(guild_id))
        if isinstance(data, dict) and data:
            return data
    except Exception:
        pass

    path = _get_path(guild_id)
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                local_data = json.load(f)
                if isinstance(local_data, dict):
                    try:
                        set_config("WebDashboardSettings", int(guild_id), local_data)
                    except Exception:
                        pass
                    return local_data
        except Exception:
            return {}
    return {}

def save_settings_config(guild_id, config):
    try:
        set_config("WebDashboardSettings", int(guild_id), config)
    except Exception:
        pass
    try:
        path = _get_path(guild_id)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(config, f, indent=2)
    except Exception:
        pass
