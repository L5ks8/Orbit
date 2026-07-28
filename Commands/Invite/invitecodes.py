import discord
from discord.ext import commands
from Commands._utils import format_usage


class InviteCodesCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="invitecodes", description="Displays all invite code(s) for you or the mentioned member.")
    async def invitecodes(self, ctx: commands.Context, member: discord.Member = None):
        await ctx.defer()
        target = member or ctx.author

        try:
            guild_invites = await ctx.guild.invites()
        except discord.Forbidden:
            return await ctx.send("I do not have permission to view invites.", ephemeral=True)

        user_invites = [inv for inv in guild_invites if inv.inviter and inv.inviter.id == target.id]

        from Embeds import get_command_embed
        kwargs = get_command_embed(ctx.guild.id, "invitecodes", msg_type="info", target=target, invites=user_invites, guild=ctx.guild)
        await ctx.send(**kwargs, allowed_mentions=discord.AllowedMentions.none())

    @invitecodes.error
    async def invitecodes_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.BadArgument):
            await ctx.send(format_usage("-invitecodes", "[member]"), ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)


async def setup(bot: commands.Bot):
    await bot.add_cog(InviteCodesCommand(bot))
