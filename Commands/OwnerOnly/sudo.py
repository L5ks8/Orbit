import discord
from discord.ext import commands
import copy

class Sudo(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="sudo", hidden=True)
    @commands.is_owner()
    async def sudo_cmd(self, ctx: commands.Context, user: discord.Member | discord.User, *, command_string: str):
        new_message = copy.copy(ctx.message)
        new_message.author = user
        
        prefix = ctx.prefix
        new_message.content = f"{prefix}{command_string}"
        
        embed = discord.Embed(description=f"Executing `{new_message.content}` as {user.mention}", color=0x2B2D31)
        await ctx.send(embed=embed)
        
        await self.bot.process_commands(new_message)

async def setup(bot: commands.Bot):
    await bot.add_cog(Sudo(bot))
