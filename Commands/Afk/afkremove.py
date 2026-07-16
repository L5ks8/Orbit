import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Commands.Afk._storage import remove_afk

class AfkRemoveLayout(LayoutView):
    def __init__(self, author: discord.Member | discord.User):
        super().__init__()
        self.container = Container(
            TextDisplay(content=f"### AFK Status Removed\nWelcome back, {author.mention} (`{author.id}`)!"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content="Your AFK status on this server has been cleared.")
        )
        self.add_item(self.container)


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

        view = AfkRemoveLayout(ctx.author)
        await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

async def setup(bot: commands.Bot):
    await bot.add_cog(AfkRemoveCommand(bot))
