import os
import sys

# Load env file to get MongoDB URI
from dotenv import load_dotenv
load_dotenv()

from Database.mongodb import get_config
from Commands.ServerStats._storage import load_serverstats_config

guild_id = 123456789  # Placeholder, let's just query the db for ALL docs in ServerStats
from Database.mongodb import get_db

db = get_db()
collection = db["ServerStats"]
docs = list(collection.find())
print("Found", len(docs), "documents in ServerStats collection.")
for doc in docs:
    print("DOC:", doc)
