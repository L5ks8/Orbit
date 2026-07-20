from Database.mongodb import get_db

def load_settings_config(guild_id: int) -> dict:
    db = get_db()
    if db is None:
        return {"manager_roles": [], "timezone": "Europe/Berlin", "embed_style": "normal", "prefix": ""}
    doc = db["GuildSettings"].find_one({"_id": guild_id})
    if not doc:
        return {"manager_roles": [], "timezone": "Europe/Berlin", "embed_style": "normal", "prefix": ""}
    return {
        "manager_roles": doc.get("manager_roles", []),
        "timezone": doc.get("timezone", "Europe/Berlin"),
        "embed_style": doc.get("embed_style", "normal"),
        "prefix": doc.get("prefix", "")
    }

def save_settings_config(guild_id: int, data: dict):
    db = get_db()
    if db is None:
        return
    
    update_data = {
        "manager_roles": data.get("manager_roles", []),
        "timezone": data.get("timezone", "Europe/Berlin"),
        "embed_style": data.get("embed_style", "normal")
    }
    
    if "prefix" in data:
        update_data["prefix"] = data.get("prefix", "")

    db["GuildSettings"].update_one(
        {"_id": guild_id},
        {"$set": update_data},
        upsert=True
    )
    
    try:
        import sys
        if "bot" in sys.modules and "prefix" in update_data:
            sys.modules["bot"].PREFIX_CACHE[guild_id] = update_data["prefix"].strip()
    except Exception:
        pass
