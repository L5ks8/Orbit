import discord
from discord.ext import commands
import json, os

class RemoveDevCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="removedev", hidden=True)
    @commands.is_owner()
    async def remove_dev(self, ctx: commands.Context, user: discord.User):
        path = os.path.join("Components/Database", "developers.json")
        devs = []
        if os.path.exists(path):
            try:
                with open(path, "r") as f:
                    devs = json.load(f)
            except Exception:
                pass
        if user.id in devs:
            devs.remove(user.id)
            with open(path, "w") as f:
                json.dump(devs, f)
            embed = discord.Embed(description=f"Removed {user.mention} from developers.", color=0x2B2D31)
            await ctx.send(embed=embed)
        else:
            embed = discord.Embed(description="User is not a developer.", color=0x2B2D31)
            await ctx.send(embed=embed)

async def setup(bot: commands.Bot):
    await bot.add_cog(RemoveDevCommand(bot))
