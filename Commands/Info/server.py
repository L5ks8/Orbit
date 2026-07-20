import discord
from discord.ext import commands
from discord.ui import Container, TextDisplay, Separator

@commands.hybrid_group(name="server", description="Server overview and inspection commands.")
async def server_group(ctx: commands.Context):
    if ctx.invoked_subcommand is None:
        await ctx.send("Please use `/server info`.", ephemeral=True)



async def _do_server_info(ctx: commands.Context):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)

    from Embeds import get_command_embed
    kwargs = get_command_embed(ctx.guild.id, "server", msg_type="info", guild=ctx.guild)
    await ctx.send(**kwargs, allowed_mentions=discord.AllowedMentions.none())

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

