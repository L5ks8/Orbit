import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow

def get_embed(msg_type: str, **kwargs):
    if msg_type == "add":
        channel_name = kwargs.get("channel_name")
        member_mention = kwargs.get("member_mention")
        member_id = kwargs.get("member_id")
        author_mention = kwargs.get("author_mention")
        
        header_str = f"### Member Added to Ticket: **#{channel_name}**\n**Status:** Access Granted"
        info_str = f"**User Added:** {member_mention} (`{member_id}`)\n**Added By:** {author_mention}"
        container = Container(TextDisplay(content=header_str), Separator(spacing=discord.SeparatorSpacing.small), TextDisplay(content=info_str))
        view = LayoutView()
        view.add_item(container)
        return {"view": view}
        
    elif msg_type == "remove":
        channel_name = kwargs.get("channel_name")
        member_mention = kwargs.get("member_mention")
        member_id = kwargs.get("member_id")
        author_mention = kwargs.get("author_mention")
        
        header_str = f"### Member Removed from Ticket: **#{channel_name}**\n**Status:** Access Revoked"
        info_str = f"**User Removed:** {member_mention} (`{member_id}`)\n**Removed By:** {author_mention}"
        container = Container(TextDisplay(content=header_str), Separator(spacing=discord.SeparatorSpacing.small), TextDisplay(content=info_str))
        view = LayoutView()
        view.add_item(container)
        return {"view": view}
        
    elif msg_type == "transcript":
        channel_name = kwargs.get("channel_name")
        channel_id = kwargs.get("channel_id")
        subject = kwargs.get("subject")
        messages_count = kwargs.get("messages_count")
        creator_id = kwargs.get("creator_id")
        executor_mention = kwargs.get("executor_mention")
        executor_id = kwargs.get("executor_id")
        
        section_closed = f"### Ticket Transcript Generated\n**Ticket:** `#{channel_name}` (`{channel_id}`)"
        section_close_info = f"**Subject:** `{subject}`\n**Messages Archived:** `{messages_count}`"
        section_creator_info = f"**Creator ID:** `{creator_id}`"
        section_executor_info = f"**Exported By:** {executor_mention} (`{executor_id}`)"
        
        container = Container(
            TextDisplay(content=section_closed), Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=section_close_info), Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=section_creator_info), Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=section_executor_info)
        )
        view = LayoutView()
        view.add_item(container)
        return {"view": view}
        
    elif msg_type == "panel":
        title = kwargs.get("title")
        description = kwargs.get("description")
        instructions = kwargs.get("instructions")
        components = kwargs.get("components", [])
        
        header_str = f"### {title}\n{description}"
        container = Container(
            TextDisplay(content=header_str), Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=instructions), Separator(spacing=discord.SeparatorSpacing.small),
            *(ActionRow(comp) for comp in components)
        )
        view = LayoutView(timeout=None)
        view.add_item(container)
        return {"view": view}
        
    elif msg_type == "control":
        channel_name = kwargs.get("channel_name")
        category_option = kwargs.get("category_option")
        creator_mention = kwargs.get("creator_mention")
        support_mention = kwargs.get("support_mention")
        subject = kwargs.get("subject")
        description = kwargs.get("description")
        components = kwargs.get("components", [])
        
        header_str = f"### Ticket Opened\n**Channel:** #{channel_name}\n**Category:** {category_option}"
        info_str = (
            f"**Creator:** {creator_mention}\n"
            f"**Assigned Team:** {support_mention}\n\n"
            f"**Subject:** {subject}\n"
            f"**Description:**\n> {description.replace(chr(10), chr(10) + '> ')}"
        )
        container = Container(TextDisplay(content=header_str), Separator(spacing=discord.SeparatorSpacing.small), TextDisplay(content=info_str))
        view = LayoutView(timeout=None)
        view.add_item(container)
        for comp in components: view.add_item(comp)
        return {"view": view}
        
    elif msg_type == "claim":
        channel_name = kwargs.get("channel_name")
        author_mention = kwargs.get("author_mention")
        subject = kwargs.get("subject")
        
        claim_header = f"### Ticket Claimed\n**Channel:** #{channel_name}"
        claim_info = f"A staff member is handling this ticket now.\n**Assigned Staff:** {author_mention}\n**Subject:** {subject}"
        status_container = Container(TextDisplay(content=claim_header), Separator(spacing=discord.SeparatorSpacing.small), TextDisplay(content=claim_info))
        view = LayoutView()
        view.add_item(status_container)
        return {"view": view}
        
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
        
        section_closed = f"### Ticket Closed\n{executor_mention} closed a ticket."
        section_close_info = f"### Close Information\n> **Ticket Name:** {channel_name}\n> **Ticket ID:** {channel_id}\n> **Reason:** {reason}"
        section_creator_info = f"### Creator Information\n> **Creator:** {creator_mention}\n> **Creator Username:** {creator_username}\n> **Creator ID:** {creator_id_str}"
        section_executor_info = f"### Executor Information\n> **Executor:** {executor_mention}\n> **Executor Username:** {executor_username}\n> **Executor ID:** {executor_id_str}"
        
        container = Container(
            TextDisplay(content=section_closed), Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=section_close_info), Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=section_creator_info), Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=section_executor_info)
        )
        view = LayoutView()
        view.add_item(container)
        return {"view": view}
        
    return {}
