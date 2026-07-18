import discord
from discord.ext import commands
from Commands.OwnerOnly._monitor import record_command

class LeaveServerCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="leaveserver", hidden=True)
    @commands.is_owner()
    async def leaveserver_cmd(self, ctx: commands.Context, target_guild_id: int):
        record_command("leaveserver", str(ctx.author))
        guild = self.bot.get_guild(target_guild_id)
        if not guild:
            return await ctx.send(f"I am not in a server with ID `{target_guild_id}`.", ephemeral=True)
        
        try:
            await guild.leave()
            await ctx.send(f"Successfully left server: **{guild.name}** (`{guild.id}`).")
        except Exception as e:
            await ctx.send(f"Failed to leave server: {e}")

async def setup(bot: commands.Bot):
    await bot.add_cog(LeaveServerCommand(bot))

