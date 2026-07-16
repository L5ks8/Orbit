import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator

@commands.hybrid_group(name="server", description="Server overview and inspection commands.")
async def server_group(ctx: commands.Context):
    if ctx.invoked_subcommand is None:
        await ctx.send("Please use `/server info`.", ephemeral=True)

class ServerInfoLayout(LayoutView):
    def __init__(self, guild: discord.Guild):
        super().__init__()
        created_timestamp = int(guild.created_at.timestamp())

        humans = len([m for m in guild.members if not m.bot])
        bots = len([m for m in guild.members if m.bot])
        total_members = guild.member_count or len(guild.members)

        text_channels = len(guild.text_channels)
        voice_channels = len(guild.voice_channels)
        categories = len(guild.categories)

        header_str = f"### Server Information: **{guild.name}**\n**Server ID:** `{guild.id}` | **Owner:** <@{guild.owner_id}>"

        stats_str = (
            f"**Created On:** <t:{created_timestamp}:F> (<t:{created_timestamp}:R>)\n\n"
            f"**Members (`{total_members}`)**\n"
            f"> Humans: `{humans}` | Bots: `{bots}`\n\n"
            f"**Channels (`{text_channels + voice_channels + categories}`)**\n"
            f"> Text: `{text_channels}` | Voice: `{voice_channels}` | Categories: `{categories}`\n\n"
            f"**Roles & Boosts**\n"
            f"> Roles: `{len(guild.roles)}` | Boost Level: `Tier {guild.premium_tier}` (`{guild.premium_subscription_count or 0} Boosts`)"
        )

        self.container = Container(
            TextDisplay(content=header_str),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=stats_str)
        )
        self.add_item(self.container)

async def _do_server_info(ctx: commands.Context):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)

    view = ServerInfoLayout(ctx.guild)
    await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

@server_group.command(name="info", description="Display complete server statistics and overview.")
async def server_info_cmd(ctx: commands.Context):
    await _do_server_info(ctx)

class ServerInfoCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

class ServerInfoPrefixFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="srv_info", aliases=["serverinfo", "infoserver", "server info"], hidden=True)
    async def server_info_prefix(self, ctx: commands.Context):
        await _do_server_info(ctx)

async def setup(bot: commands.Bot):
    if "server" not in bot.all_commands:
        bot.add_command(server_group)
    await bot.add_cog(ServerInfoCommand(bot))
    await bot.add_cog(ServerInfoPrefixFallback(bot))
