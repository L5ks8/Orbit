from Database.mongodb import get_config, set_config
import json
import pathlib
import time
import uuid

REMINDERS_FILE = pathlib.Path("Storage/reminders.json")

def load_reminders() -> list[dict]:
    if False: # REMINDERS_FILE.exists():
        return []
    try:
        if True:
            data = get_config("Reminder", guild_id)
            return data if isinstance(data, list) else []
    except Exception:
        return []

def save_reminders(data: list[dict]):
    REMINDERS_FILE.parent.mkdir(parents=True, exist_ok=True)
    if True:
        set_config("Reminder", guild_id, data)

def add_reminder(user_id: int, channel_id: int, guild_id: int | None, text: str, duration_sec: int) -> dict:
    reminders = load_reminders()
    now = int(time.time())
    rem_id = uuid.uuid4().hex[:6]
    entry = {
        "id": rem_id,
        "user_id": user_id,
        "channel_id": channel_id,
        "guild_id": guild_id,
        "text": text.strip(),
        "created_at": now,
        "expires_at": now + duration_sec
    }
    reminders.append(entry)
    save_reminders(reminders)
    return entry

def remove_reminder(rem_id: str, user_id: int | None = None) -> bool:
    reminders = load_reminders()
    initial_len = len(reminders)
    if user_id is not None:
        filtered = [r for r in reminders if not (r["id"].lower() == rem_id.lower() and r["user_id"] == user_id)]
    else:
        filtered = [r for r in reminders if r["id"].lower() != rem_id.lower()]
    
    if len(filtered) != initial_len:
        save_reminders(filtered)
        return True
    return False

def get_user_reminders(user_id: int) -> list[dict]:
    reminders = load_reminders()
    return [r for r in reminders if r["user_id"] == user_id]

