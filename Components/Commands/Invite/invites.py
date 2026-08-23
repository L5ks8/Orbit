import discord
from discord.ext import commands
from Components.Commands.Invite._storage import get_inviter_stats
from Components.Commands._utils import format_usage, make_embed


class InvitesCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="invites", description="Displays your invitations or the mentioned member ones.")
    async def invites(self, ctx: commands.Context, member: discord.Member = None):
        await ctx.defer()
        target = member or ctx.author

        stats = get_inviter_stats(ctx.guild.id, target.id)
        
        embed = discord.Embed(
            color=0x00FFFF
        )
        embed.set_author(name=target.display_name, icon_url=target.display_avatar.url if target else None)
        
        embed.description = (
            f"{target.mention} currently has **{stats['total']}** invites. "
            f"(**{stats['regular']}** regular, **{stats['left']}** left, **{stats['fake']}** fake, **{stats['bonus']}** bonus)"
        )
        await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())

    @invites.error
    async def invites_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.BadArgument):
            await ctx.send(embed=make_embed(format_usage("-invites", "[member]"), discord.Color.red()), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)


async def setup(bot: commands.Bot):
    await bot.add_cog(InvitesCommand(bot))