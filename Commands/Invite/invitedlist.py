import discord
from discord.ext import commands
from Commands.Invite._storage import get_invited_by_user, get_invited_by_code
from Commands._utils import format_usage
class InvitedListCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
    @commands.hybrid_command(name="invitedlist", description="Displays who someone or a specific invite code has invited.")
    async def invitedlist(self, ctx: commands.Context, target: str = None):
        await ctx.defer()
        member = None
        code = None
        if target is None:
            member = ctx.author
        else:
            try:
                member = await commands.MemberConverter().convert(ctx, target)
            except commands.BadArgument:
                code = target.strip()
        invited = []
        display_target = None
        if member:
            raw = get_invited_by_user(ctx.guild.id, member.id)
            display_target = member
            for entry in raw:
                mid = entry.get("member_id")
                if mid:
                    try:
                        u = ctx.guild.get_member(int(mid))
                        if not u:
                            u = await ctx.bot.fetch_user(int(mid))
                        invited.append({"user": u, "code": entry.get("code", "?")})
                    except Exception:
                        invited.append({"user": None, "user_id": mid, "code": entry.get("code", "?")})
        elif code:
            member_ids = get_invited_by_code(ctx.guild.id, code)
            display_target = code
            for mid in member_ids:
                try:
                    u = ctx.guild.get_member(int(mid))
                    if not u:
                        u = await ctx.bot.fetch_user(int(mid))
                    invited.append({"user": u, "code": code})
                except Exception:
                    invited.append({"user": None, "user_id": mid, "code": code})
        from Embeds import get_command_embed
        kwargs = get_command_embed(
            ctx.guild.id, "invitedlist", msg_type="info",
            target=display_target, invited=invited, guild=ctx.guild, is_code=code is not None
        )
        await ctx.send(**kwargs, allowed_mentions=discord.AllowedMentions.none())
    @invitedlist.error
    async def invitedlist_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.BadArgument):
            await ctx.send(format_usage("-invitedlist", "[member or invite code]"), ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)
async def setup(bot: commands.Bot):
    await bot.add_cog(InvitedListCommand(bot))