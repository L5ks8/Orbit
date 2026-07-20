import discord
from discord.ui import Button, View

def get_embed(msg_type: str, **kwargs):
    if msg_type == "panel":
        embed = discord.Embed(
            title="Server Security Verification",
            description="To protect against automated bots and spam, this server requires CAPTCHA verification before accessing channels.\n\n> Click **Verify Now** below to receive an automated security image with connected characters.",
            color=discord.Color.blue()
        )
        btn_verify = Button(label="Verify Now", style=discord.ButtonStyle.success, custom_id="orbit:verify_start")
        view = View(timeout=None)
        view.add_item(btn_verify)
        return {"embed": embed, "view": view}
        
    elif msg_type == "setup_success":
        guild_name = kwargs.get("guild_name")
        channel_mention = kwargs.get("channel_mention")
        role_mention = kwargs.get("role_mention")
        rem_str = kwargs.get("rem_str")
        kick_str = kwargs.get("kick_str")
        
        embed = discord.Embed(title=f"Verification Configured: {guild_name}", color=discord.Color.green())
        embed.add_field(name="Verification Channel", value=channel_mention, inline=False)
        embed.add_field(name="Granted Role", value=role_mention, inline=False)
        embed.add_field(name="Removed Role", value=rem_str, inline=False)
        embed.add_field(name="Auto-Kick Timer", value=kick_str, inline=False)
        embed.set_footer(text="The interactive verification panel is now live.")
        return {"embed": embed}
        
    elif msg_type == "captcha":
        filename = kwargs.get("filename")
        role_id = kwargs.get("role_id")
        remove_role_id = kwargs.get("remove_role_id")
        
        embed = discord.Embed(
            title="Security Verification: Solve the CAPTCHA",
            description="Please look at the connected characters in the image below and click **Enter CAPTCHA Code** to type what you see.",
            color=discord.Color.blurple()
        )
        embed.set_image(url=f"attachment://{filename}")
        
        # We need to return the embed, but the view is handled by CaptchaInteractionLayout which isn't persistent
        # We'll pass components as an argument and build the view
        components = kwargs.get("components")
        view = View(timeout=600)
        if components:
            for c in components:
                view.add_item(c)
                
        return {"embed": embed, "view": view if components else None}
        
    elif msg_type == "status":
        guild_name = kwargs.get("guild_name")
        active = kwargs.get("active")
        enabled_str = kwargs.get("enabled_str")
        ch_display = kwargs.get("ch_display")
        role_display = kwargs.get("role_display")
        rem_display = kwargs.get("rem_display")
        kick_str = kwargs.get("kick_str")
        pending = kwargs.get("pending")
        
        embed = discord.Embed(title=f"Server Verification Status: {guild_name}", color=discord.Color.blue() if active else discord.Color.red())
        embed.add_field(name="Status", value="Active" if active else "Inactive", inline=False)
        embed.add_field(name="System Enabled", value=enabled_str, inline=True)
        embed.add_field(name="Channel", value=ch_display, inline=True)
        embed.add_field(name="Granted Role", value=role_display, inline=True)
        embed.add_field(name="Removed Role", value=rem_display, inline=True)
        embed.add_field(name="Auto-Kick Timer", value=kick_str, inline=True)
        embed.add_field(name="Pending Unverified", value=f"`{pending}`", inline=True)
        return {"embed": embed}
        
    return {}
