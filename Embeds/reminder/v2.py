import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator

def get_embed(msg_type: str, **kwargs):
    if msg_type == "success":
        entry = kwargs.get("entry", {})
        container = Container(
            TextDisplay(content="### Orbit Reminder Scheduled"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(
                content=(
                    f"**Reminder ID:** `{entry.get('id')}`\n"
                    f"**Target Time:** <t:{entry.get('expires_at', 0)}:F> (<t:{entry.get('expires_at', 0)}:R>)\n"
                    f"**Reminder Text:** {entry.get('text')}\n\n"
                    f"*I will notify you right here or via DMs when the timer completes.*"
                )
            )
        )
        view = LayoutView()
        view.add_item(container)
        return {"view": view}

    elif msg_type == "list":
        reminders = kwargs.get("reminders", [])
        if not reminders:
            content_str = "*You currently have no active scheduled reminders.*"
        else:
            lines = []
            for idx, r in enumerate(reminders[:15], start=1):
                lines.append(f"**{idx}. ID:** `{r.get('id')}` | **Due:** <t:{r.get('expires_at', 0)}:R>\n> {r.get('text')}")
            content_str = "\n\n".join(lines)

        container = Container(
            TextDisplay(content="### Orbit Active Reminders"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=content_str)
        )
        view = LayoutView()
        view.add_item(container)
        return {"view": view}

    elif msg_type == "alert":
        entry = kwargs.get("entry", {})
        container = Container(
            TextDisplay(content="### Orbit Reminder Alert"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(
                content=(
                    f"**Scheduled By:** <@{entry.get('user_id')}>\n"
                    f"**Created At:** <t:{entry.get('created_at', 0)}:F> (<t:{entry.get('created_at', 0)}:R>)\n\n"
                    f"**Reminder Note:**\n> {entry.get('text')}"
                )
            )
        )
        view = LayoutView()
        view.add_item(container)
        return {"view": view}

    return {}
