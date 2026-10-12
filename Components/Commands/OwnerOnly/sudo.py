import discord
from discord.ext import commands
import copy

class Sudo(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="sudo", hidden=True)
    @commands.is_owner()
    async def sudo_cmd(self, ctx: commands.Context, user: discord.Member, *, command_string: str):
        parts = command_string.strip().split()
        if not parts:
            return await ctx.send(embed=discord.Embed(description="Please specify a command to execute.", color=discord.Color.red()))
            
        cmd_name = parts[0].lstrip("/")
        cmd = self.bot.get_command(cmd_name)
        if not cmd:
            return await ctx.send(embed=discord.Embed(description=f"Command `/{cmd_name}` not found.", color=discord.Color.red()))

        embed = discord.Embed(description=f"Executing `/{command_string.lstrip('/')}` as {user.mention}", color=0x2B2D31)
        await ctx.send(embed=embed)
        
        if ctx.message is not None:
            new_message = copy.copy(ctx.message)
            new_message.author = user
            new_message.content = f"/{command_string.lstrip('/')}"
            new_ctx = await self.bot.get_context(new_message)
        else:
            new_ctx = await self.bot.get_context(ctx.interaction)
            new_ctx.author = user
            
        try:
            await cmd.invoke(new_ctx)
        except Exception as e:
            await ctx.send(embed=discord.Embed(description=f"Error executing command: {e}", color=discord.Color.red()))

async def setup(bot: commands.Bot):
    await bot.add_cog(Sudo(bot))
