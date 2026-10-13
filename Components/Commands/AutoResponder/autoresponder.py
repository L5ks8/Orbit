import discord
from discord.ext import commands
from discord import app_commands
from Components.Commands._utils import make_embed, make_v2_card, ORBIT_COLOR, InteractionContext
from Components.emojis import Emojis

class AutoResponderCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @app_commands.command(name="autoresponder", description="Manage auto-responses.")
    async def autoresponder_cmd(self, interaction: discord.Interaction):
        ctx = InteractionContext(interaction)
        card = make_v2_card("# Auto Responder\n\nConfigure and manage auto-responses in your server dashboard.", color=ORBIT_COLOR)
        if card:
            return await ctx.send(view=card, ephemeral=True)
        await ctx.send(embed=make_embed("Configure and manage auto-responses in your server dashboard."), ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(AutoResponderCog(bot))
