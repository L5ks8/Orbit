import discord
from discord.ext import commands
from discord.ui import Container, TextDisplay, Separator
from Commands.Afk._storage import remove_afk



class AfkRemoveCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="afkremove", description="Removes your AFK status on this server.")
    async def afkremove(self, ctx: commands.Context):
        if not ctx.guild:
            return await ctx.send("This command can only be used inside a server.", ephemeral=True)

        success = remove_afk(ctx.guild.id, ctx.author.id)
        if not success:
            return await ctx.send("You are not currently AFK on this server.", ephemeral=True)

        from Embeds import get_command_embed
        kwargs = get_command_embed(ctx.guild.id, "afk", msg_type="remove", author=ctx.author)
        await ctx.send(**kwargs, allowed_mentions=discord.AllowedMentions.none())

async def setup(bot: commands.Bot):
    await bot.add_cog(AfkRemoveCommand(bot))

