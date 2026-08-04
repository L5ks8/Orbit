

from Database.mongodb import get_db
from typing import Dict, Any, List, Optional
import discord


# ─── In-memory invite cache ───
# guild_id -> {code: uses}
_invite_cache: Dict[int, Dict[str, int]] = {}


def get_invite_cache(guild_id: int) -> Dict[str, int]:
    return _invite_cache.get(guild_id, {})


def set_invite_cache(guild_id: int, cache: Dict[str, int]):
    _invite_cache[guild_id] = cache


async def refresh_invite_cache(guild: discord.Guild):
    """Fetch current invites and store uses in cache."""
    try:
        invites = await guild.invites()
        cache = {}
        for inv in invites:
            cache[inv.code] = inv.uses or 0
        set_invite_cache(guild.id, cache)
    except discord.Forbidden:
        pass
    except Exception:
        pass


# ─── Database functions ───

def _collection():
    db = get_db()
    return db["InviteTracker"]

def _stats_collection():
    db = get_db()
    return db["InviteStats"]

def record_invite(guild_id: int, member_id: int, inviter_id: int, code: str):
    """Record that a member was invited by someone using a specific code."""
    col = _collection()
    col.update_one(
        {"_id": f"{guild_id}_{member_id}"},
        {"$set": {
            "guild_id": str(guild_id),
            "member_id": str(member_id),
            "inviter_id": str(inviter_id),
            "code": code,
            "left": False
        }},
        upsert=True
    )


def get_invite_info(guild_id: int, member_id: int) -> Optional[Dict[str, Any]]:
    """Get who invited a specific member."""
    col = _collection()
    doc = col.find_one({"_id": f"{guild_id}_{member_id}"})
    if doc:
        doc.pop("_id", None)
    return doc


def get_inviter_stats(guild_id: int, inviter_id: int) -> Dict[str, Any]:
    """Get full invite stats for a specific user."""
    col = _collection()
    invited_members = list(col.find({
        "guild_id": str(guild_id),
        "inviter_id": str(inviter_id)
    }))
    
    regular = 0
    left = 0
    for doc in invited_members:
        if doc.get("left", False):
            left += 1
        else:
            regular += 1
            
    stats_col = _stats_collection()
    stats_doc = stats_col.find_one({"_id": f"{guild_id}_{inviter_id}"}) or {}
    
    bonus = stats_doc.get("bonus", 0)
    fake = stats_doc.get("fake", 0)
    
    total = regular + bonus + fake
    
    return {
        "regular": regular,
        "left": left,
        "bonus": bonus,
        "fake": fake,
        "total": total,
        "members": [doc.get("member_id") for doc in invited_members if not doc.get("left")]
    }

def get_leaderboard(guild_id: int, limit: int = 10) -> List[Dict[str, Any]]:
    col = _collection()
    
    pipeline = [
        {"$match": {"guild_id": str(guild_id), "left": {"$ne": True}}},
        {"$group": {"_id": "$inviter_id", "regular": {"$sum": 1}}}
    ]
    
    regular_counts = list(col.aggregate(pipeline))
    
    stats_col = _stats_collection()
    stats_docs = list(stats_col.find({"guild_id": str(guild_id)}))
    
    user_totals = {}
    for doc in regular_counts:
        uid = doc["_id"]
        user_totals[uid] = {"regular": doc["regular"], "bonus": 0, "fake": 0, "left": 0}
        
    left_pipeline = [
        {"$match": {"guild_id": str(guild_id), "left": True}},
        {"$group": {"_id": "$inviter_id", "left": {"$sum": 1}}}
    ]
    left_counts = list(col.aggregate(left_pipeline))
    for doc in left_counts:
        uid = doc["_id"]
        if uid not in user_totals:
            user_totals[uid] = {"regular": 0, "bonus": 0, "fake": 0, "left": 0}
        user_totals[uid]["left"] = doc["left"]
        
    for doc in stats_docs:
        uid = doc.get("user_id")
        if not uid: continue
        if uid not in user_totals:
            user_totals[uid] = {"regular": 0, "bonus": 0, "fake": 0, "left": 0}
        user_totals[uid]["bonus"] = doc.get("bonus", 0)
        user_totals[uid]["fake"] = doc.get("fake", 0)
        
    lb = []
    for uid, data in user_totals.items():
        total = data["regular"] + data["bonus"] + data["fake"]
        if total > 0 or data["regular"] > 0:
            lb.append({"user_id": uid, "total": total, **data})
            
    lb.sort(key=lambda x: x["total"], reverse=True)
    return lb[:limit]

def add_bonus_invites(guild_id: int, user_id: int, amount: int):
    stats_col = _stats_collection()
    stats_col.update_one(
        {"_id": f"{guild_id}_{user_id}"},
        {"$inc": {"bonus": amount}, "$set": {"guild_id": str(guild_id), "user_id": str(user_id)}},
        upsert=True
    )

def remove_bonus_invites(guild_id: int, user_id: int, amount: int):
    stats_col = _stats_collection()
    stats_col.update_one(
        {"_id": f"{guild_id}_{user_id}"},
        {"$inc": {"bonus": -amount}, "$set": {"guild_id": str(guild_id), "user_id": str(user_id)}},
        upsert=True
    )

def add_fake_invites(guild_id: int, user_id: int, amount: int):
    stats_col = _stats_collection()
    stats_col.update_one(
        {"_id": f"{guild_id}_{user_id}"},
        {"$inc": {"fake": amount}, "$set": {"guild_id": str(guild_id), "user_id": str(user_id)}},
        upsert=True
    )

def remove_fake_invites(guild_id: int, user_id: int, amount: int):
    stats_col = _stats_collection()
    stats_col.update_one(
        {"_id": f"{guild_id}_{user_id}"},
        {"$inc": {"fake": -amount}, "$set": {"guild_id": str(guild_id), "user_id": str(user_id)}},
        upsert=True
    )

def reset_invites(guild_id: int, user_id: Optional[int] = None):
    col = _collection()
    stats_col = _stats_collection()
    if user_id:
        col.delete_many({"guild_id": str(guild_id), "inviter_id": str(user_id)})
        stats_col.delete_one({"_id": f"{guild_id}_{user_id}"})
    else:
        col.delete_many({"guild_id": str(guild_id)})
        stats_col.delete_many({"guild_id": str(guild_id)})

def get_invited_by_code(guild_id: int, code: str) -> List[str]:
    """Get all members invited with a specific code."""
    col = _collection()
    docs = list(col.find({
        "guild_id": str(guild_id),
        "code": code,
        "left": {"$ne": True}
    }))
    return [doc.get("member_id") for doc in docs]


def get_invited_by_user(guild_id: int, inviter_id: int) -> List[Dict[str, str]]:
    """Get all members invited by a specific user."""
    col = _collection()
    docs = list(col.find({
        "guild_id": str(guild_id),
        "inviter_id": str(inviter_id),
        "left": {"$ne": True}
    }))
    return [{"member_id": doc.get("member_id"), "code": doc.get("code")} for doc in docs]


def remove_invite_record(guild_id: int, member_id: int):
    """Mark invite record as left when a member leaves."""
    col = _collection()
    col.update_one(
        {"_id": f"{guild_id}_{member_id}"},
        {"$set": {"left": True}}
    )
