from Database.mongodb import get_db

def load_reaction_roles(guild_id: int) -> list:
    db = get_db()
    cursor = db["ReactionRoles"].find({"guild_id": str(guild_id)}, {"_id": 0})
    return list(cursor)

def save_reaction_role(guild_id: int, data: dict) -> None:
    db = get_db()
    db["ReactionRoles"].replace_one({"id": data["id"], "guild_id": str(guild_id)}, data, upsert=True)

def delete_reaction_role(guild_id: int, msg_id: str) -> None:
    db = get_db()
    db["ReactionRoles"].delete_one({"id": msg_id, "guild_id": str(guild_id)})
