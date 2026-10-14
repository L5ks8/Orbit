from Components.Database.mongodb import get_config, set_config
import json
import pathlib
import random
import string
import time
from typing import Dict, Any, List

STORAGE_ROOT = pathlib.Path("Storage")

def _get_file_path(guild_id: int) -> pathlib.Path:
    folder = STORAGE_ROOT / str(guild_id)
    if not folder.exists():
        folder.mkdir(parents=True, exist_ok=True)
    return folder / "polls.json"

def load_polls(guild_id: int) -> Dict[str, Dict[str, Any]]:
    path = _get_file_path(guild_id)
    try:
        data = get_config("Poll", guild_id)
        if isinstance(data, dict):
            return data
    except Exception:
        pass
    if path.exists():
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {}

def save_polls(guild_id: int, data: Dict[str, Dict[str, Any]]) -> None:
    try:
        set_config("Poll", guild_id, data)
    except Exception:
        pass
    path = _get_file_path(guild_id)
    try:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4)
    except Exception:
        pass

def generate_poll_id(guild_id: int) -> str:
    data = load_polls(guild_id)
    while True:
        pid = "P-" + "".join(random.choices(string.digits, k=6))
        if pid not in data:
            return pid

def create_poll_entry(
    guild_id: int,
    poll_id: str,
    channel_id: int,
    message_id: int,
    question: str,
    options: list[str],
    author_id: int,
    duration_minutes: int = 60,
    end_timestamp: int = 0
) -> Dict[str, Any]:
    data = load_polls(guild_id)
    now = int(time.time())
    if not end_timestamp:
        end_timestamp = now + (duration_minutes * 60)

    entry = {
        "poll_id": poll_id,
        "channel_id": channel_id,
        "message_id": message_id,
        "question": question,
        "options": options,
        "author_id": author_id,
        "duration_minutes": duration_minutes,
        "end_timestamp": end_timestamp,
        "votes": {str(idx): [] for idx in range(len(options))},
        "closed": False,
        "closed_by": None
    }
    data[poll_id] = entry
    save_polls(guild_id, data)
    return entry

def get_poll_entry(guild_id: int, poll_id: str) -> Dict[str, Any] | None:
    data = load_polls(guild_id)
    pid_clean = poll_id.strip().upper()
    if not pid_clean.startswith("P-"):
        if f"P-{pid_clean}" in data:
            return data[f"P-{pid_clean}"]
    return data.get(pid_clean)

def get_poll_by_message_id(guild_id: int, message_id: int) -> Dict[str, Any] | None:
    data = load_polls(guild_id)
    for entry in data.values():
        if entry.get("message_id") == message_id:
            return entry
    return None

def update_poll_entry(guild_id: int, entry: Dict[str, Any]) -> None:
    data = load_polls(guild_id)
    pid = entry["poll_id"]
    data[pid] = entry
    save_polls(guild_id, data)

def record_vote(guild_id: int, poll_id: str, user_id: int, option_idx: int) -> tuple[str, str, Dict[str, Any] | None]:
    """
    Records or toggles a user's vote for an option.
    Returns: (action, option_name, updated_entry)
      action can be: 'voted', 'changed', 'removed', or 'invalid'
    """
    data = load_polls(guild_id)
    pid_clean = poll_id.strip().upper()
    if not pid_clean.startswith("P-"):
        if f"P-{pid_clean}" in data:
            pid_clean = f"P-{pid_clean}"

    entry = data.get(pid_clean)
    if not entry or entry.get("closed"):
        return ("invalid", "", entry)

    options = entry.get("options", [])
    if option_idx < 0 or option_idx >= len(options):
        return ("invalid", "", entry)

    votes = entry.setdefault("votes", {})
    # Ensure all option indices exist as list
    for i in range(len(options)):
        if str(i) not in votes or not isinstance(votes[str(i)], list):
            votes[str(i)] = []

    target_key = str(option_idx)
    target_name = options[option_idx]

    # Check previous vote
    prev_idx = None
    for k, uids in votes.items():
        if user_id in uids:
            prev_idx = k
            uids.remove(user_id)
            break

    if prev_idx == target_key:
        # User toggled off their vote
        action = "removed"
    elif prev_idx is not None:
        # User switched their vote
        votes[target_key].append(user_id)
        action = "changed"
    else:
        # First time voting
        votes[target_key].append(user_id)
        action = "voted"

    save_polls(guild_id, data)
    return (action, target_name, entry)

def remove_vote(guild_id: int, poll_id: str, user_id: int) -> tuple[bool, Dict[str, Any] | None]:
    data = load_polls(guild_id)
    pid_clean = poll_id.strip().upper()
    if not pid_clean.startswith("P-"):
        if f"P-{pid_clean}" in data:
            pid_clean = f"P-{pid_clean}"

    entry = data.get(pid_clean)
    if not entry:
        return (False, None)

    votes = entry.setdefault("votes", {})
    removed = False
    for k, uids in votes.items():
        if isinstance(uids, list) and user_id in uids:
            uids.remove(user_id)
            removed = True

    if removed:
        save_polls(guild_id, data)
    return (removed, entry)

def close_poll_entry(guild_id: int, poll_id: str, closed_by: int | None = None) -> Dict[str, Any] | None:
    data = load_polls(guild_id)
    pid_clean = poll_id.strip().upper()
    if not pid_clean.startswith("P-"):
        if f"P-{pid_clean}" in data:
            pid_clean = f"P-{pid_clean}"

    if pid_clean not in data:
        return None

    entry = data[pid_clean]
    entry["closed"] = True
    if closed_by:
        entry["closed_by"] = closed_by
    save_polls(guild_id, data)
    return entry

def get_all_active_polls() -> List[tuple[int, Dict[str, Any]]]:
    seen_polls = set()
    active = []
    try:
        from Components.Database.mongodb import get_db
        db = get_db()
        if db is not None:
            col = db["Poll"]
            for doc in col.find():
                gid_str = doc.get("_id")
                if gid_str and str(gid_str).isdigit():
                    gid = int(gid_str)
                    for k, v in doc.items():
                        if k != "_id" and isinstance(v, dict) and not v.get("closed"):
                            pid = v.get("poll_id", k)
                            if pid not in seen_polls:
                                seen_polls.add(pid)
                                active.append((gid, v))
    except Exception as e:
        print(f"[PollStorage] Mongo error: {e}")

    try:
        if STORAGE_ROOT.exists():
            for guild_folder in STORAGE_ROOT.iterdir():
                if guild_folder.is_dir() and guild_folder.name.isdigit():
                    gid = int(guild_folder.name)
                    data = load_polls(gid)
                    for k, entry in data.items():
                        if isinstance(entry, dict) and not entry.get("closed"):
                            pid = entry.get("poll_id", k)
                            if pid not in seen_polls:
                                seen_polls.add(pid)
                                active.append((gid, entry))
    except Exception as e:
        print(f"[PollStorage] File error: {e}")

    return active
