import json
import os
import secrets
from typing import Dict, Any

from Database.mongodb import get_config, set_config

def load_embeds_config(guild_id: int) -> Dict[str, Any]:
    return get_config("EmbedBuilder", guild_id, {"embeds": []})

def save_embeds_config(guild_id: int, data: Dict[str, Any]):
    set_config("EmbedBuilder", guild_id, data)
