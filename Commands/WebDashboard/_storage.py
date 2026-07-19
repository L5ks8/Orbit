from Database.mongodb import get_db

def load_settings_config(guild_id: int) -> dict:
    db = get_db()
    if db is None:
        return {"manager_roles": [], "timezone": "Europe/Berlin"}
    doc = db["GuildSettings"].find_one({"_id": guild_id})
    if not doc:
        return {"manager_roles": [], "timezone": "Europe/Berlin"}
    return {
        "manager_roles": doc.get("manager_roles", []),
        "timezone": doc.get("timezone", "Europe/Berlin")
    }

def save_settings_config(guild_id: int, data: dict):
    db = get_db()
    if db is None:
        return
    db["GuildSettings"].update_one(
        {"_id": guild_id},
        {"$set": {
            "manager_roles": data.get("manager_roles", []),
            "timezone": data.get("timezone", "Europe/Berlin")
        }},
        upsert=True
    )
