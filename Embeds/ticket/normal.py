import discord
from discord.ui import View

def get_embed(msg_type: str, **kwargs):
    if msg_type == "add":
        channel_name = kwargs.get("channel_name")
        member_mention = kwargs.get("member_mention")
        member_id = kwargs.get("member_id")
        author_mention = kwargs.get("author_mention")
        
        embed = discord.Embed(title=f"Member Added: #{channel_name}", color=discord.Color.green())
        embed.add_field(name="User Added", value=f"{member_mention} (`{member_id}`)", inline=False)
        embed.add_field(name="Added By", value=author_mention, inline=False)
        return {"embed": embed}
        
    elif msg_type == "remove":
        channel_name = kwargs.get("channel_name")
        member_mention = kwargs.get("member_mention")
        member_id = kwargs.get("member_id")
        author_mention = kwargs.get("author_mention")
        
        embed = discord.Embed(title=f"Member Removed: #{channel_name}", color=discord.Color.red())
        embed.add_field(name="User Removed", value=f"{member_mention} (`{member_id}`)", inline=False)
        embed.add_field(name="Removed By", value=author_mention, inline=False)
        return {"embed": embed}
        
    elif msg_type == "transcript":
        channel_name = kwargs.get("channel_name")
        channel_id = kwargs.get("channel_id")
        subject = kwargs.get("subject")
        messages_count = kwargs.get("messages_count")
        creator_id = kwargs.get("creator_id")
        executor_mention = kwargs.get("executor_mention")
        executor_id = kwargs.get("executor_id")
        
        embed = discord.Embed(title="Ticket Transcript Generated", color=discord.Color.blue())
        embed.add_field(name="Ticket", value=f"`#{channel_name}` (`{channel_id}`)", inline=False)
        embed.add_field(name="Subject", value=f"`{subject}`", inline=True)
        embed.add_field(name="Messages", value=f"`{messages_count}`", inline=True)
        embed.add_field(name="Creator ID", value=f"`{creator_id}`", inline=False)
        embed.add_field(name="Exported By", value=f"{executor_mention} (`{executor_id}`)", inline=False)
        return {"embed": embed}
        
    elif msg_type == "panel":
        title = kwargs.get("title")
        description = kwargs.get("description")
        instructions = kwargs.get("instructions")
        components = kwargs.get("components", [])
        
        embed = discord.Embed(title=title, description=f"{description}\n\n{instructions}", color=discord.Color.teal())
        view = View(timeout=None)
        for comp in components: view.add_item(comp)
        return {"embed": embed, "view": view}
        
    elif msg_type == "control":
        channel_name = kwargs.get("channel_name")
        category_option = kwargs.get("category_option")
        creator_mention = kwargs.get("creator_mention")
        support_mention = kwargs.get("support_mention")
        subject = kwargs.get("subject")
        description = kwargs.get("description")
        components = kwargs.get("components", [])
        
        embed = discord.Embed(title=f"Ticket Opened: #{channel_name}", color=discord.Color.blurple())
        embed.add_field(name="Category", value=category_option, inline=False)
        embed.add_field(name="Creator", value=creator_mention, inline=True)
        embed.add_field(name="Assigned Team", value=support_mention, inline=True)
        embed.add_field(name="Subject", value=subject, inline=False)
        embed.add_field(name="Description", value=f"```\n{description}\n```", inline=False)
        
        view = View(timeout=None)
        for comp in components: view.add_item(comp)
        return {"embed": embed, "view": view}
        
    elif msg_type == "claim":
        channel_name = kwargs.get("channel_name")
        author_mention = kwargs.get("author_mention")
        subject = kwargs.get("subject")
        
        embed = discord.Embed(title=f"Ticket Claimed: #{channel_name}", color=discord.Color.yellow())
        embed.description = "A staff member is handling this ticket now."
        embed.add_field(name="Assigned Staff", value=author_mention, inline=False)
        embed.add_field(name="Subject", value=subject, inline=False)
        return {"embed": embed}
        
    elif msg_type == "close":
        executor_mention = kwargs.get("executor_mention")
        channel_name = kwargs.get("channel_name")
        channel_id = kwargs.get("channel_id")
        reason = kwargs.get("reason")
        creator_mention = kwargs.get("creator_mention")
        creator_username = kwargs.get("creator_username")
        creator_id_str = kwargs.get("creator_id_str")
        executor_username = kwargs.get("executor_username")
        executor_id_str = kwargs.get("executor_id_str")
        
        embed = discord.Embed(title="Ticket Closed", description=f"{executor_mention} closed a ticket.", color=discord.Color.dark_red())
        embed.add_field(name="Ticket Info", value=f"Name: {channel_name}\nID: {channel_id}\nReason: {reason}", inline=False)
        embed.add_field(name="Creator Info", value=f"Creator: {creator_mention}\nUsername: {creator_username}\nID: {creator_id_str}", inline=False)
        embed.add_field(name="Executor Info", value=f"Executor: {executor_mention}\nUsername: {executor_username}\nID: {executor_id_str}", inline=False)
        return {"embed": embed}
        
    return {}
