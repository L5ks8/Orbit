import discord

# Orbit Emojis Registry - Pure text mode (no custom emojis)
# In command responses and embeds, only pure text is used.

class Emojis:
    WINNER = ""
    WARNING = ""
    VOICE_HOURS = ""
    VERIFICATION = ""
    RELOAD = ""
    POLL = ""
    PING = ""
    NO_ENTRY = ""
    MESSAGES = ""
    MAIL = ""
    KEYBOARD = ""
    HONEYPOT = ""
    GUIDE = ""
    GOLD = ""
    GLOBE_VERIFICATION = ""
    ERROR = ""
    CLOUD_ERROR = ""
    BAN = ""
    BACKSPACE = ""
    ANNOUNCEMENT = ""

    RAW_IDS = {}

    @classmethod
    def partial(cls, name: str):
        return None
