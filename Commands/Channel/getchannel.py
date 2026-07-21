import discord
from discord.ext import commands
from discord import app_commands
from typing import Optional

class GetChannelCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @app_commands.command(name="getchannel", description="Get a channel's name by its ID or channel selection.")
    @app_commands.describe(
        channel_id="The ID or mention of the channel",
        channel="Select a channel directly"
    )
    async def getchannel_slash(
        self,
        interaction: discord.Interaction,
        channel_id: Optional[str] = None,
        channel: Optional[discord.abc.GuildChannel] = None
    ):
        if not interaction.guild:
            return await interaction.response.send_message("This command can only be used in a server.", ephemeral=True)

        target_channel = channel

        if not target_channel and channel_id:
            clean_id_str = channel_id.strip("<#> ")
            if clean_id_str.isdigit():
                ch_id = int(clean_id_str)
                target_channel = interaction.guild.get_channel(ch_id)
                if not target_channel:
                    try:
                        target_channel = await interaction.guild.fetch_channel(ch_id)
                    except Exception:
                        target_channel = None

        if not target_channel:
            return await interaction.response.send_message("❌ Please specify a valid channel or channel ID.", ephemeral=True)

        content = f"**Channel Name:**\n```{target_channel.name}```\nCopy name: `{target_channel.name}`"
        await interaction.response.send_message(content, ephemeral=True)

    @commands.command(name="getchannel", aliases=["getch"], help="Get a channel's name by its ID.")
    async def getchannel_prefix(self, ctx: commands.Context, channel_id: str):
        if not ctx.guild:
            return await ctx.send("This command can only be used in a server.", ephemeral=True)

        clean_id_str = channel_id.strip("<#> ")
        if not clean_id_str.isdigit():
            return await ctx.send("❌ Invalid channel ID provided.", ephemeral=True)

        ch_id = int(clean_id_str)
        target_channel = ctx.guild.get_channel(ch_id)
        if not target_channel:
            try:
                target_channel = await ctx.guild.fetch_channel(ch_id)
            except Exception:
                target_channel = None

        if not target_channel:
            return await ctx.send(f"❌ Could not find a channel with ID `{clean_id_str}`.", ephemeral=True)

        content = f"**Channel Name:**\n```{target_channel.name}```\nCopy name: `{target_channel.name}`"
        await ctx.send(content, ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(GetChannelCog(bot))
