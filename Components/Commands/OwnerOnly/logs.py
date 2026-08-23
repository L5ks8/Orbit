import discord
from discord.ext import commands
from Components.Commands.OwnerOnly._monitor import get_live_logs, record_command
from Components.Commands._utils import make_embed

class LiveLogsCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="logs", hidden=True)
    @commands.is_owner()
    async def logs_cmd(self, ctx: commands.Context):
        record_command("logs", str(ctx.author))
        if ctx.guild is not None:
            try:
                await ctx.message.delete()
            except Exception:
                pass
                
        raw_logs = get_live_logs(15)
        if not raw_logs:
            logs_str = "`[System]` Zero log events recorded yet."
        else:
            clean_lines = [line[:130] for line in raw_logs]
            logs_str = "\n".join(clean_lines)
            if len(logs_str) > 3000:
                logs_str = logs_str[:3000] + "\n...(truncated)"
                
        embed = discord.Embed(
            title="Orbit Live System Event Stream",
            description=logs_str,
            color=0x2B2D31
        )
        embed.set_footer(text=f"Authorized Developer: {ctx.author}", icon_url=ctx.author.avatar.url if ctx.author.avatar else None)
        await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())

    @logs_cmd.error
    async def logs_error(self, ctx: commands.Context, error):
        if not isinstance(error, commands.NotOwner):
            await ctx.send(embed=make_embed(f"Livelogs error: {error}", discord.Color.red()), allowed_mentions=discord.AllowedMentions.none())

async def setup(bot: commands.Bot):
    await bot.add_cog(LiveLogsCommand(bot))