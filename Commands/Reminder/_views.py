import re
import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator

def parse_duration(time_str: str) -> int | None:
    clean_str = time_str.lower().strip()
    pattern = re.compile(r"(\d+)\s*([smhd])")
    matches = pattern.findall(clean_str)
    if not matches:
        if clean_str.isdigit():
            return int(clean_str) * 60
        return None
    
    total_seconds = 0
    for value, unit in matches:
        val = int(value)
        if unit == "s":
            total_seconds += val
        elif unit == "m":
            total_seconds += val * 60
        elif unit == "h":
            total_seconds += val * 3600
        elif unit == "d":
            total_seconds += val * 86400
    return total_seconds if total_seconds > 0 else None

class ReminderSuccessLayout(LayoutView):
    def __init__(self, entry: dict):
        super().__init__()
        self.container = Container(
            TextDisplay(content="### Orbit Reminder Scheduled"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(
                content=(
                    f"**Reminder ID:** `{entry['id']}`\n"
                    f"**Target Time:** <t:{entry['expires_at']}:F> (<t:{entry['expires_at']}:R>)\n"
                    f"**Reminder Text:** {entry['text']}\n\n"
                    f"*I will notify you right here or via DMs when the timer completes.*"
                )
            )
        )
        self.add_item(self.container)

class ReminderListLayout(LayoutView):
    def __init__(self, reminders: list[dict]):
        super().__init__()
        if not reminders:
            content_str = "*You currently have no active scheduled reminders.*"
        else:
            lines = []
            for idx, r in enumerate(reminders[:15], start=1):
                lines.append(f"**{idx}. ID:** `{r['id']}` | **Due:** <t:{r['expires_at']}:R>\n> {r['text']}")
            content_str = "\n\n".join(lines)

        self.container = Container(
            TextDisplay(content="### Orbit Active Reminders"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=content_str)
        )
        self.add_item(self.container)

class ReminderAlertLayout(LayoutView):
    def __init__(self, entry: dict):
        super().__init__()
        self.container = Container(
            TextDisplay(content="### Orbit Reminder Alert"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(
                content=(
                    f"**Scheduled By:** <@{entry['user_id']}>\n"
                    f"**Created At:** <t:{entry['created_at']}:F> (<t:{entry['created_at']}:R>)\n\n"
                    f"**Reminder Note:**\n> {entry['text']}"
                )
            )
        )
        self.add_item(self.container)
