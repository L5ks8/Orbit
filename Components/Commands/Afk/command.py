import discord
from discord import app_commands
from discord.ext import commands
from .storage import set_afk, get_afk, remove_afk
from Components.Commands._utils import make_embed, make_v2_card, ORBIT_COLOR, InteractionContext

class AfkCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @app_commands.command(name="afk", description="Sets your AFK status with an optional reason.")
    async def afk(self, interaction: discord.Interaction, *, reason: str = "AFK"):
        ctx = InteractionContext(interaction)
        if not ctx.guild:
            return await ctx.send(embed=make_embed("This command can only be used inside a server.", discord.Color.red()), ephemeral=True)

        set_afk(ctx.guild.id, ctx.author.id, reason)
        content = f"# AFK Status Enabled\n\n**User:** {ctx.author.mention} (`{ctx.author.id}`)\n**Reason:** {reason}"
        card = make_v2_card(content, color=ORBIT_COLOR)
        if card:
            await ctx.send(view=card, allowed_mentions=discord.AllowedMentions.none())
        else:
            embed = discord.Embed(title="AFK Status Enabled", color=ORBIT_COLOR)
            embed.add_field(name="User", value=f"{ctx.author.mention} (`{ctx.author.id}`)", inline=False)
            embed.add_field(name="Reason", value=reason, inline=False)
            await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())

    @app_commands.command(name="afkremove", description="Removes your AFK status on this server.")
    async def afkremove(self, interaction: discord.Interaction):
        ctx = InteractionContext(interaction)
        if not ctx.guild:
            return await ctx.send(embed=make_embed("This command can only be used inside a server.", discord.Color.red()), ephemeral=True)

        success = remove_afk(ctx.guild.id, ctx.author.id)
        if not success:
            return await ctx.send(embed=make_embed("You are not currently AFK on this server.", discord.Color.red()), ephemeral=True)

        content = f"# AFK Status Removed\n\nWelcome back, {ctx.author.mention} (`{ctx.author.id}`)!\nYour AFK status on this server has been cleared."
        card = make_v2_card(content, color=ORBIT_COLOR)
        if card:
            await ctx.send(view=card, allowed_mentions=discord.AllowedMentions.none())
        else:
            embed = discord.Embed(title="AFK Status Removed", description=f"Welcome back, {ctx.author.mention} (`{ctx.author.id}`)!\nYour AFK status on this server has been cleared.", color=ORBIT_COLOR)
            await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())

async def setup(bot: commands.Bot):
    await bot.add_cog(AfkCommand(bot))
