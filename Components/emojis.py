import discord

class Emojis:
    WINNER = "<:Winner:1559278366786326658>"
    WARNING = "<:Warning:1559278365209272451>"
    VOICE_HOURS = "<:VoiceHours:1559278363246329946>"
    VERIFICATION = "<:Verification:1559278361845567688>"
    RELOAD = "<:Reload:1559278359899279402>"
    POLL = "<:Poll:1559278358360100985>"
    PING = "<:Ping:1559278356640301056>"
    NO_ENTRY = "<:NoEntry:1559278355252125706>"
    MESSAGES = "<:Messages:1559278353314349116>"
    MAIL = "<:Mail:1559278351519055922>"
    KEYBOARD = "<:Keyboard:1559278349958783006>"
    HONEYPOT = "<:Honeypot:1559278347778002975>"
    GUIDE = "<:Guide:1559278345903022114>"
    GOLD = "<:Gold:1559278344191868978>"
    GLOBE_VERIFICATION = "<:GlobeVerification:1559278342698569828>"
    ERROR = "<:Error:1559278341255733349>"
    CLOUD_ERROR = "<:CloudError:1559278339376545902>"
    BAN = "<:Ban:1559278337392910487>"
    BACKSPACE = "<:Backspace:1559278335895404646>"

    # Helper mappings
    RAW_IDS = {
        "Winner": 1559278366786326658,
        "Warning": 1559278365209272451,
        "VoiceHours": 1559278363246329946,
        "Verification": 1559278361845567688,
        "Reload": 1559278359899279402,
        "Poll": 1559278358360100985,
        "Ping": 1559278356640301056,
        "NoEntry": 1559278355252125706,
        "Messages": 1559278353314349116,
        "Mail": 1559278351519055922,
        "Keyboard": 1559278349958783006,
        "Honeypot": 1559278347778002975,
        "Guide": 1559278345903022114,
        "Gold": 1559278344191868978,
        "GlobeVerification": 1559278342698569828,
        "Error": 1559278341255733349,
        "CloudError": 1559278339376545902,
        "Ban": 1559278337392910487,
        "Backspace": 1559278335895404646,
    }

    @classmethod
    def partial(cls, name: str) -> discord.PartialEmoji:

        emoji_id = cls.RAW_IDS.get(name)
        if emoji_id:
            return discord.PartialEmoji(name=name, id=emoji_id)
        return discord.PartialEmoji(name=name)
