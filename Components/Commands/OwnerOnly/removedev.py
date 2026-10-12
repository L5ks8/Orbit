import discord
from Components.Commands._utils import ORBIT_COLOR, make_v2_card
from Components.emojis import Emojis
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
            desc = f"Removed {user.mention} from developers."
            card = make_v2_card(f"# {Emojis.BACKSPACE} Developer Removed\n\n{desc}", color=ORBIT_COLOR)
            if card:
                return await ctx.send(view=card)
            embed = discord.Embed(description=f"{Emojis.BACKSPACE} {desc}", color=ORBIT_COLOR)
            await ctx.send(embed=embed)
        else:
            desc = "User is not a developer."
            card = make_v2_card(f"# {Emojis.WARNING} Notice\n\n{desc}", color=ORBIT_COLOR)
            if card:
                return await ctx.send(view=card)
            embed = discord.Embed(description=f"{Emojis.WARNING} {desc}", color=ORBIT_COLOR)
            await ctx.send(embed=embed)

async def setup(bot: commands.Bot):
    await bot.add_cog(RemoveDevCommand(bot))
