import os
from pymongo import MongoClient
from typing import Dict, Any

_client = None
_db = None

def get_db():
    global _client, _db
    if _client is None:
        uri = os.environ.get("MONGODB_URI")
        if not uri:
            from dotenv import load_dotenv
            load_dotenv()
            uri = os.environ.get("MONGODB_URI")
        
        if not uri:
            print("WARNING: MONGODB_URI is not set. Database will not work properly.")
            _client = MongoClient("mongodb://localhost:27017/") 
        else:
            _client = MongoClient(uri)
        
        _db = _client["OrbitBot"]
    return _db

def get_config(collection_name: str, guild_id: int, default_config: Dict[str, Any] = None) -> Dict[str, Any]:
    db = get_db()
    collection = db[collection_name]
    doc = collection.find_one({"_id": str(guild_id)})
    
    if not doc:
        file_to_collection = {
            'ticket.json': 'Ticket', 'verify.json': 'Verify', 'automod.json': 'AutoMod',
            'welcome.json': 'Welcome', 'goodbye.json': 'Goodbye',
            'boost.json': 'Boost', 'level_config.json': 'Level', 'jtc_config.json': 'JoinToCreate',
            'jtc_channels.json': 'JoinToCreate_Channels', 'blacklist.json': 'Blacklist',
            'whitelist.json': 'Whitelist', 'afk.json': 'Afk', 'autoresponder.json': 'AutoResponder',
            'automation.json': 'ChannelAutomation', 'joinroles.json': 'JoinRole'
        }
        filename = next((k for k, v in file_to_collection.items() if v == collection_name), None)
        if filename:
            import os, json
            path = os.path.join("Storage", str(guild_id), filename)
            if os.path.exists(path):
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        migrated = json.load(f)
                    if migrated:
                        doc = migrated
                        set_config(collection_name, guild_id, migrated)
                        try:
                            os.remove(path)
                        except Exception:
                            pass
                except Exception:
                    pass
    if not doc:
        return default_config or {}
    
    doc.pop("_id", None)
    
    if default_config:
        return {**default_config, **doc}
    return doc

def set_config(collection_name: str, guild_id: int, config: Dict[str, Any]) -> None:
    db = get_db()
    collection = db[collection_name]
    
    doc = config.copy()
    doc["_id"] = str(guild_id)
    
    collection.replace_one({"_id": str(guild_id)}, doc, upsert=True)
