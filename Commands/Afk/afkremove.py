import discord
from discord.ext import commands
from Commands.Afk._storage import remove_afk
from Commands._utils import make_embed



class AfkRemoveCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="afkremove", description="Removes your AFK status on this server.")
    async def afkremove(self, ctx: commands.Context):
        if not ctx.guild:
            return await ctx.send(embed=make_embed("This command can only be used inside a server.", discord.Color.red()), ephemeral=True)

        success = remove_afk(ctx.guild.id, ctx.author.id)
        if not success:
            return await ctx.send(embed=make_embed("You are not currently AFK on this server.", discord.Color.red()), ephemeral=True)

        embed = discord.Embed(title="AFK Status Removed", description=f"Welcome back, {ctx.author.mention} (`{ctx.author.id}`)!\nYour AFK status on this server has been cleared.", color=discord.Color.green())
        await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())

async def setup(bot: commands.Bot):
    await bot.add_cog(AfkRemoveCommand(bot))
