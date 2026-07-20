from Database.mongodb import get_db

def load_settings_config(guild_id: int) -> dict:
    db = get_db()
    if db is None:
        return {"manager_roles": [], "timezone": "Europe/Berlin", "embed_style": "normal"}
    doc = db["GuildSettings"].find_one({"_id": guild_id})
    if not doc:
        return {"manager_roles": [], "timezone": "Europe/Berlin", "embed_style": "normal"}
    return {
        "manager_roles": doc.get("manager_roles", []),
        "timezone": doc.get("timezone", "Europe/Berlin"),
        "embed_style": doc.get("embed_style", "normal")
    }

def save_settings_config(guild_id: int, data: dict):
    db = get_db()
    if db is None:
        return
    db["GuildSettings"].update_one(
        {"_id": guild_id},
        {"$set": {
            "manager_roles": data.get("manager_roles", []),
            "timezone": data.get("timezone", "Europe/Berlin"),
            "embed_style": data.get("embed_style", "normal")
        }},
        upsert=True
    )
