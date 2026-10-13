import discord
from Components.Commands._utils import ORBIT_COLOR, make_v2_card
from Components.emojis import Emojis
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
            desc = f"Added {user.mention} as a developer."
            card = make_v2_card(f"# Developer Added\n\n{desc}", color=ORBIT_COLOR)
            if card:
                return await ctx.send(view=card)
            embed = discord.Embed(description=f"{desc}", color=ORBIT_COLOR)
            await ctx.send(embed=embed)
        else:
            desc = "User is already a developer."
            card = make_v2_card(f"# Notice\n\n{desc}", color=ORBIT_COLOR)
            if card:
                return await ctx.send(view=card)
            embed = discord.Embed(description=f"{desc}", color=ORBIT_COLOR)
            await ctx.send(embed=embed)

async def setup(bot: commands.Bot):
    await bot.add_cog(AddDevCommand(bot))
