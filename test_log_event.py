import asyncio
from Components.Dashboard.Automoderation.log_storage import log_event
import discord
from unittest.mock import AsyncMock, MagicMock

async def run_test():
    guild = MagicMock(spec=discord.Guild)
    guild.id = 123
    
    channel = AsyncMock(spec=discord.TextChannel)
    channel.id = 456
    
    guild.get_channel.return_value = channel
    guild.fetch_channel.return_value = channel
    
    import Components.Dashboard.Automoderation.log_storage as ls
    
    ls.load_log_config = MagicMock(return_value={
        "enabled": True,
        "categories": {
            "channel_created": True,
            "message_deleted": True
        },
        "channels": {
            "server_updates": "456",
            "message_deleted": "456"
        },
        "roles": {},
        "global_exempt_channels": [],
        "global_exempt_roles": []
    })
    
    await log_event(guild, "channel_created", "Title", "Desc")
    await log_event(guild, "message_deleted", "Title", "Desc")
    
    print("Channel send call count:", channel.send.call_count)

asyncio.run(run_test())
