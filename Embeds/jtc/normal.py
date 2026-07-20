import discord

def get_embed(msg_type: str, **kwargs):
    if msg_type == "control":
        data = kwargs.get("data", {})
        components = kwargs.get("components", [])

        owner_id = data.get("owner_id", "Unknown")
        owner_mention = f"<@{owner_id}>" if owner_id != "Unknown" else "Unknown"

        status_lock = "Locked" if data.get("locked") else "Unlocked"
        status_vis = "Hidden" if data.get("hidden") else "Visible"

        trusted_list = data.get("trusted_users", [])
        if trusted_list:
            trusted_display = ", ".join(f"<@{u}>" for u in trusted_list)
        else:
            trusted_display = "*No trusted users*"

        embed = discord.Embed(title="Your Voice Channel", color=discord.Color.teal())
        embed.add_field(name="Owner", value=owner_mention, inline=False)
        embed.add_field(name="Channel Status", value=f"{status_lock} | {status_vis}", inline=False)
        embed.add_field(name="Trusted Users", value=trusted_display, inline=False)
        embed.set_footer(text="Use the buttons below to manage your channel.")
        
        view = discord.ui.View(timeout=None)
        
        # We need to split the 8 buttons into two ActionRows equivalent (discord.py View handles 5 per row)
        # However, for embeds with Components V1, discord.py places them in rows of 5 automatically,
        # but to maintain the layout, we can just add them sequentially.
        for i, comp in enumerate(components):
            comp.row = i // 4
            view.add_item(comp)
            
        return {"embed": embed, "view": view}
        
    return {}
