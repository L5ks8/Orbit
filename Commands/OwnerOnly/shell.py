import discord
from discord.ext import commands

class Shell(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="shell", aliases=["cmd"], hidden=True)
    @commands.is_owner()
    async def shell_cmd(self, ctx: commands.Context, *, command: str):
        import asyncio
        process = await asyncio.create_subprocess_shell(
            command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        stdout, stderr = await process.communicate()
        
        output = stdout.decode(errors='ignore')
        error = stderr.decode(errors='ignore')
        
        result = output if output else error if error else "Command executed with no output."
        if len(result) > 1900:
            result = result[:1900] + "\n... [Truncated]"
            
        embed = discord.Embed(
            title=f"Shell Execution",
            description=f"```bash\n$ {command}\n\n{result}\n```",
            color=0x2B2D31
        )
        await ctx.send(embed=embed)

async def setup(bot: commands.Bot):
    await bot.add_cog(Shell(bot))
