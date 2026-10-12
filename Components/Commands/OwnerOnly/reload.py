import discord
from Components.Commands._utils import ORBIT_COLOR, make_v2_card
from Components.emojis import Emojis
from discord.ext import commands

class ReloadCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="reload", hidden=True)
    @commands.is_owner()
    async def reload_cmd(self, ctx: commands.Context, module: str):
        try:
            try:
                await self.bot.reload_extension(module)
                msg = f"Successfully reloaded `{module}`"
                card = make_v2_card(f"# {Emojis.RELOAD} Module Reloaded\n\n{msg}", color=ORBIT_COLOR)
                if card:
                    await ctx.send(view=card)
                else:
                    await ctx.send(embed=discord.Embed(description=f"{Emojis.RELOAD} {msg}", color=ORBIT_COLOR))
            except commands.ExtensionNotLoaded:
                await self.bot.load_extension(module)
                msg = f"Successfully loaded `{module}`"
                card = make_v2_card(f"# {Emojis.VERIFICATION} Module Loaded\n\n{msg}", color=ORBIT_COLOR)
                if card:
                    await ctx.send(view=card)
                else:
                    await ctx.send(embed=discord.Embed(description=f"{Emojis.VERIFICATION} {msg}", color=ORBIT_COLOR))
        except Exception as e:
            import traceback
            tb = traceback.format_exc()
            card = make_v2_card(f"# {Emojis.ERROR} Error Loading Module\n\nFailed to load/reload `{module}`:\n```py\n{tb[:1800]}\n```", color=ORBIT_COLOR)
            if card:
                await ctx.send(view=card)
            else:
                await ctx.send(embed=discord.Embed(title=f"{Emojis.ERROR} Error Loading Module", description=f"Failed to load/reload `{module}`:\n```py\n{tb[:1900]}\n```", color=ORBIT_COLOR))

async def setup(bot: commands.Bot):
    await bot.add_cog(ReloadCommand(bot))
