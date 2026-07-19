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
            # Fallback for local testing if env is not loaded properly
            from dotenv import load_dotenv
            load_dotenv()
            uri = os.environ.get("MONGODB_URI")
        
        if not uri:
            print("WARNING: MONGODB_URI is not set. Database will not work properly.")
            # We don't crash, but it will fail on query.
            # In production on Render, they must set MONGODB_URI in the environment variables.
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
        return default_config or {}
    
    # Remove the _id before returning so it matches the expected dict format
    doc.pop("_id", None)
    
    if default_config:
        return {**default_config, **doc}
    return doc

def set_config(collection_name: str, guild_id: int, config: Dict[str, Any]) -> None:
    db = get_db()
    collection = db[collection_name]
    
    # We must insert/update the _id to be the guild_id string
    doc = config.copy()
    doc["_id"] = str(guild_id)
    
    collection.replace_one({"_id": str(guild_id)}, doc, upsert=True)
