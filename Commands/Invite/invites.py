import discord
from discord.ext import commands
from Commands.Invite._storage import get_inviter_stats
from Commands._utils import format_usage


class InvitesCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="invites", description="Displays your invitations or the mentioned member ones.")
    async def invites(self, ctx: commands.Context, member: discord.Member = None):
        await ctx.defer()
        target = member or ctx.author

        stats = get_inviter_stats(ctx.guild.id, target.id)
        
        from Embeds import get_command_embed
        kwargs = get_command_embed(ctx.guild.id, "invites", msg_type="info", target=target, stats=stats, guild=ctx.guild)
        await ctx.send(**kwargs, allowed_mentions=discord.AllowedMentions.none())

    @invites.error
    async def invites_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.BadArgument):
            await ctx.send(format_usage("-invites", "[member]"), ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)


async def setup(bot: commands.Bot):
    await bot.add_cog(InvitesCommand(bot))
