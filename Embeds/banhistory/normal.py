import discord

def get_embed(msg_type: str, **kwargs):
    if msg_type == "list":
        target_id = kwargs.get("target_id")
        target_name = kwargs.get("target_name")
        total_bans = kwargs.get("total_bans")
        page = kwargs.get("page")
        total_pages = kwargs.get("total_pages")
        slice_bans = kwargs.get("slice_bans", [])
        components = kwargs.get("components", [])

        lines = []
        for b in slice_bans:
            lines.append(
                f"**ID:** `{b['ban_id']}` | **Mod:** <@{b['moderator_id']}>\n"
                f"**Reason:** {b['reason']} (<t:{b['timestamp']}:R>)"
            )
        bans_text = "\n\n".join(lines) if lines else "No ban history found on this page."
        
        embed = discord.Embed(
            title=f"🔨 Permanent Ban History: {target_name}",
            description=bans_text,
            color=discord.Color.dark_theme()
        )
        embed.set_footer(text=f"Total Past Bans: {total_bans} • Page {page} of {total_pages}")
        
        view = discord.ui.View(timeout=None)
        for comp in components:
            view.add_item(comp)
            
        return {"embed": embed, "view": view}
    return {}
