import discord

def get_embed(msg_type: str, **kwargs):
    guild = kwargs.get("guild")
    config = kwargs.get("config", {})
    components = kwargs.get("components", [])

    status_badge = "Active" if config.get("enabled") and config.get("channel_id") else "Disabled"
    ch_id = config.get("channel_id")
    ch_display = f"<#{ch_id}> (`{ch_id}`)" if ch_id else "`No channel configured`"

    embed = discord.Embed(
        title=f"Welcome System Overview: {guild.name}",
        description=(
            f"**Status:** {status_badge}\n"
            f"**Welcome Channel:** {ch_display}\n"
            f"**Message Template:**\n> {config.get('message', 'Default')}\n\n"
            f"-# Available template variables: `{{user}}`, `{{server}}`, `{{count}}`, `{{username}}`"
        ),
        color=discord.Color.blue()
    )
    
    icon_url = guild.icon.with_size(256).url if guild.icon else None
    if icon_url:
        embed.set_thumbnail(url=icon_url)

    from discord.ui import View
    view = View(timeout=300)
    for comp in components:
        view.add_item(comp)

    return {"embed": embed, "view": view}
