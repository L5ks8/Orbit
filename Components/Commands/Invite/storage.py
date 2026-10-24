

from Components.Database.mongodb import get_db
from typing import Dict, Any, List, Optional
import discord


# ─── In-memory invite cache ───
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
        "guild_id": {"$in": [str(guild_id), int(guild_id)]},
        "inviter_id": {"$in": [str(inviter_id), int(inviter_id)]}
    }))
    
    regular = 0
    left = 0
    for doc in invited_members:
        if doc.get("left", False):
            left += 1
        else:
            regular += 1
            
    stats_col = _stats_collection()
    stats_doc = stats_col.find_one({
        "$or": [
            {"_id": f"{guild_id}_{inviter_id}"},
            {"guild_id": {"$in": [str(guild_id), int(guild_id)]}, "user_id": {"$in": [str(inviter_id), int(inviter_id)]}}
        ]
    }) or {}
    
    bonus = stats_doc.get("bonus", 0)
    fake = stats_doc.get("fake", 0)

    # Check legacy/alternative Invites collection if empty
    if regular == 0 and bonus == 0 and left == 0:
        try:
            db = get_db()
            legacy = db["Invites"].find_one({
                "guild_id": {"$in": [str(guild_id), int(guild_id)]},
                "user_id": {"$in": [str(inviter_id), int(inviter_id)]}
            })
            if legacy:
                regular = int(legacy.get("regular", 0) or 0)
                bonus = int(legacy.get("bonus", 0) or 0)
                fake = int(legacy.get("fake", 0) or 0)
                left = int(legacy.get("left", 0) or 0)
        except Exception:
            pass
    
    total = regular + bonus + fake
    
    return {
        "regular": regular,
        "left": left,
        "bonus": bonus,
        "fake": fake,
        "total": total,
        "members": [str(doc.get("member_id")) for doc in invited_members if not doc.get("left")]
    }

def get_leaderboard(guild_id: int, limit: int = 10) -> List[Dict[str, Any]]:
    col = _collection()
    
    pipeline = [
        {"$match": {"guild_id": {"$in": [str(guild_id), int(guild_id)]}, "left": {"$ne": True}}},
        {"$group": {"_id": "$inviter_id", "regular": {"$sum": 1}}}
    ]
    
    regular_counts = []
    try:
        regular_counts = list(col.aggregate(pipeline))
    except Exception:
        pass
    
    stats_col = _stats_collection()
    stats_docs = []
    try:
        stats_docs = list(stats_col.find({"guild_id": {"$in": [str(guild_id), int(guild_id)]}}))
    except Exception:
        pass
    
    user_totals = {}
    for doc in regular_counts:
        uid = str(doc.get("_id") or "").strip()
        if not uid or uid == "None": continue
        user_totals[uid] = {"regular": int(doc.get("regular", 0) or 0), "bonus": 0, "fake": 0, "left": 0}
        
    left_pipeline = [
        {"$match": {"guild_id": {"$in": [str(guild_id), int(guild_id)]}, "left": True}},
        {"$group": {"_id": "$inviter_id", "left": {"$sum": 1}}}
    ]
    try:
        left_counts = list(col.aggregate(left_pipeline))
        for doc in left_counts:
            uid = str(doc.get("_id") or "").strip()
            if not uid or uid == "None": continue
            if uid not in user_totals:
                user_totals[uid] = {"regular": 0, "bonus": 0, "fake": 0, "left": 0}
            user_totals[uid]["left"] = int(doc.get("left", 0) or 0)
    except Exception:
        pass
        
    for doc in stats_docs:
        uid = str(doc.get("user_id") or "").strip()
        if not uid or uid == "None": continue
        if uid not in user_totals:
            user_totals[uid] = {"regular": 0, "bonus": 0, "fake": 0, "left": 0}
        user_totals[uid]["bonus"] = int(doc.get("bonus", 0) or 0)
        user_totals[uid]["fake"] = int(doc.get("fake", 0) or 0)

    # Check alternative/legacy collections in MongoDB (Invites / InviteJoins)
    try:
        db = get_db()
        alt_invs = list(db["Invites"].find({"guild_id": {"$in": [str(guild_id), int(guild_id)]}}))
        for adoc in alt_invs:
            uid = str(adoc.get("user_id") or adoc.get("inviter_id") or "").strip()
            if not uid or uid == "None": continue
            reg = int(adoc.get("regular", 0) or 0)
            bon = int(adoc.get("bonus", 0) or 0)
            fak = int(adoc.get("fake", 0) or 0)
            lft = int(adoc.get("left", 0) or 0)
            if uid not in user_totals:
                user_totals[uid] = {"regular": reg, "bonus": bon, "fake": fak, "left": lft}
            else:
                user_totals[uid]["regular"] = max(user_totals[uid]["regular"], reg)
                user_totals[uid]["bonus"] = max(user_totals[uid]["bonus"], bon)
                user_totals[uid]["fake"] = max(user_totals[uid]["fake"], fak)
                user_totals[uid]["left"] = max(user_totals[uid]["left"], lft)
    except Exception:
        pass

    try:
        db = get_db()
        join_docs = list(db["InviteJoins"].find({"guild_id": {"$in": [str(guild_id), int(guild_id)]}}))
        for jdoc in join_docs:
            uid = str(jdoc.get("inviter_id") or "").strip()
            if not uid or uid == "None": continue
            if uid not in user_totals:
                user_totals[uid] = {"regular": 0, "bonus": 0, "fake": 0, "left": 0}
            if jdoc.get("left"):
                user_totals[uid]["left"] += 1
            else:
                user_totals[uid]["regular"] += 1
    except Exception:
        pass
        
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
        "guild_id": {"$in": [str(guild_id), int(guild_id)]},
        "code": code,
        "left": {"$ne": True}
    }))
    return [str(doc.get("member_id")) for doc in docs if doc.get("member_id")]


def get_invited_by_user(guild_id: int, inviter_id: int) -> List[Dict[str, str]]:
    """Get all members invited by a specific user."""
    col = _collection()
    docs = list(col.find({
        "guild_id": {"$in": [str(guild_id), int(guild_id)]},
        "inviter_id": {"$in": [str(inviter_id), int(inviter_id)]},
        "left": {"$ne": True}
    }))
    return [{"member_id": str(doc.get("member_id")), "code": str(doc.get("code") or "")} for doc in docs if doc.get("member_id")]


def remove_invite_record(guild_id: int, member_id: int):
    """Mark invite record as left when a member leaves."""
    col = _collection()
    col.update_one(
        {"_id": f"{guild_id}_{member_id}"},
        {"$set": {"left": True}}
    )
