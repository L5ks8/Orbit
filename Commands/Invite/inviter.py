import discord
from discord.ext import commands
from Commands.Invite._storage import get_invite_info
from Commands._utils import format_usage


class InviterCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="inviter", description="Displays who invited the mentioned member.")
    async def inviter(self, ctx: commands.Context, member: discord.Member = None):
        await ctx.defer()
        target = member or ctx.author

        info = get_invite_info(ctx.guild.id, target.id)

        inviter_user = None
        code = None
        if info:
            inviter_id = info.get("inviter_id")
            code = info.get("code")
            if inviter_id:
                try:
                    inviter_user = ctx.guild.get_member(int(inviter_id))
                    if not inviter_user:
                        inviter_user = await ctx.bot.fetch_user(int(inviter_id))
                except Exception:
                    pass

        from Embeds import get_command_embed
        kwargs = get_command_embed(
            ctx.guild.id, "inviter", msg_type="info",
            target=target, inviter=inviter_user, code=code, guild=ctx.guild
        )
        await ctx.send(**kwargs, allowed_mentions=discord.AllowedMentions.none())

    @inviter.error
    async def inviter_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingRequiredArgument):
            await ctx.send(format_usage("-inviter", "<member>"), ephemeral=True)
        elif isinstance(error, commands.BadArgument):
            await ctx.send(format_usage("-inviter", "<member>"), ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)


async def setup(bot: commands.Bot):
    await bot.add_cog(InviterCommand(bot))
