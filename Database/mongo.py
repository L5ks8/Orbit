import os
import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from typing import Dict, Any

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    print("WARNING: MONGO_URI not found in environment variables. Database operations will fail.")

_client = AsyncIOMotorClient(MONGO_URI, tlsCAFile=certifi.where()) if MONGO_URI else None
db = _client.orbit if _client else None

def get_collection(name: str):
    if db is None:
        raise ConnectionError("MongoDB is not connected (MONGO_URI missing).")
    return db[name]

async def get_config(guild_id: int, module_name: str) -> Dict[str, Any]:
    if db is None:
        return {"_id": guild_id}
    collection = db[module_name]
    doc = await collection.find_one({"_id": guild_id})
    return doc or {"_id": guild_id}

async def save_config(guild_id: int, module_name: str, data: Dict[str, Any]):
    if db is None:
        return
    collection = db[module_name]
    data["_id"] = guild_id
    await collection.replace_one({"_id": guild_id}, data, upsert=True)
