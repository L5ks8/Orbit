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
            # Try to resolve as member
            try:
                member = await commands.MemberConverter().convert(ctx, target)
            except commands.BadArgument:
                # Treat as invite code
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

        is_code = code is not None

        embed = discord.Embed(
            title="Invited List",
            color=discord.Color.blurple()
        )

        if is_code:
            header = f"Members invited with code `{display_target}`"
        else:
            header = f"Members invited by {display_target.mention}"
            embed.set_thumbnail(url=display_target.display_avatar.url if hasattr(display_target, "display_avatar") else None)

        if not invited:
            embed.description = f"{header}\n\nNo invited members found."
        else:
            lines = []
            for i, entry in enumerate(invited[:25], 1):
                user_obj = entry.get("user")
                code_str = entry.get("code", "?")
                if user_obj:
                    lines.append(f"`{i}.` {user_obj.mention} — Code: `{code_str}`")
                else:
                    uid = entry.get("user_id", "?")
                    lines.append(f"`{i}.` User ID: `{uid}` — Code: `{code_str}`")
            embed.description = f"{header}\n\n" + "\n".join(lines)
            if len(invited) > 25:
                embed.set_footer(text=f"Showing 25 of {len(invited)} invited members")
            elif ctx.guild:
                embed.set_footer(text=ctx.guild.name, icon_url=ctx.guild.icon.url if ctx.guild.icon else None)

        await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())

    @invitedlist.error
    async def invitedlist_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.BadArgument):
            await ctx.send(format_usage("-invitedlist", "[member or invite code]"), ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)


async def setup(bot: commands.Bot):
    await bot.add_cog(InvitedListCommand(bot))
