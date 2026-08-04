import discord
from discord.ext import commands
from discord.ui import Container, TextDisplay, Separator
async def _do_server_info(ctx: commands.Context):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)
    from Embeds import get_command_embed
    kwargs = get_command_embed(ctx.guild.id, "server", msg_type="info", guild=ctx.guild)
    await ctx.send(**kwargs, allowed_mentions=discord.AllowedMentions.none())
class ServerInfoCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
    @commands.hybrid_command(name="serverinfo", aliases=["server"], description="Display complete server statistics and overview.")
    async def serverinfo_cmd(self, ctx: commands.Context):
        await _do_server_info(ctx)
async def setup(bot: commands.Bot):
    if "server" in bot.all_commands and isinstance(bot.all_commands["server"], commands.Group):
        bot.remove_command("server")
    await bot.add_cog(ServerInfoCommand(bot))