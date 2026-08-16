import json
import os

DATA_DIR = os.path.join("Database", "WebDashboard")

def _get_path(guild_id):
    os.makedirs(DATA_DIR, exist_ok=True)
    return os.path.join(DATA_DIR, f"{guild_id}.json")

def load_settings_config(guild_id):
    path = _get_path(guild_id)
    if os.path.exists(path):
        try:
            with open(path, "r") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def save_settings_config(guild_id, config):
    path = _get_path(guild_id)
    with open(path, "w") as f:
        json.dump(config, f, indent=2)
