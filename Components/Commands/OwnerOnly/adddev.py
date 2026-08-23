import discord
from discord.ext import commands
import json, os

class AddDevCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="adddev", hidden=True)
    @commands.is_owner()
    async def add_dev(self, ctx: commands.Context, user: discord.User):
        path = os.path.join("Components/Database", "developers.json")
        os.makedirs("Components/Database", exist_ok=True)
        devs = []
        if os.path.exists(path):
            try:
                with open(path, "r") as f:
                    devs = json.load(f)
            except Exception:
                pass
        if user.id not in devs:
            devs.append(user.id)
            with open(path, "w") as f:
                json.dump(devs, f)
            embed = discord.Embed(description=f"Added {user.mention} as a developer.", color=0x2B2D31)
            await ctx.send(embed=embed)
        else:
            embed = discord.Embed(description="User is already a developer.", color=0x2B2D31)
            await ctx.send(embed=embed)

async def setup(bot: commands.Bot):
    await bot.add_cog(AddDevCommand(bot))
