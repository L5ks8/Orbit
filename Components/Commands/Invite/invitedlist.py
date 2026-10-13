import discord
from discord import app_commands
from discord.ext import commands
from Components.Commands.Invite._storage import get_invited_by_user, get_invited_by_code
from Components.Commands._utils import format_usage, make_embed, make_v2_card, ORBIT_COLOR, InteractionContext
from Components.emojis import Emojis


class InvitedListCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @app_commands.command(name="invitedlist", description="Displays who someone or a specific invite code has invited.")
    async def invitedlist(self, interaction: discord.Interaction, target: str = None):
        ctx = InteractionContext(interaction)
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

        is_code = code is not None

        if is_code:
            header = f"Members invited with code `{display_target}`"
        else:
            header = f"Members invited by {display_target.mention}"

        if not invited:
            body = f"{header}\n\nNo invited members found."
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
            body = f"{header}\n\n" + "\n".join(lines)

        footer_text = f"Showing 25 of {len(invited)} invited members" if len(invited) > 25 else (ctx.guild.name if ctx.guild else None)
        card = make_v2_card(f"# Invited List\n\n{body}", color=ORBIT_COLOR, footer=footer_text)
        if card:
            return await ctx.send(view=card, allowed_mentions=discord.AllowedMentions.none())

        embed = discord.Embed(
            title="Invited List",
            description=body,
            color=ORBIT_COLOR
        )
        if not is_code and hasattr(display_target, "display_avatar"):
            embed.set_thumbnail(url=display_target.display_avatar.url)
        if footer_text:
            embed.set_footer(text=footer_text, icon_url=ctx.guild.icon.url if ctx.guild and ctx.guild.icon and len(invited) <= 25 else None)

        await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())

    @invitedlist.error
    async def invitedlist_error(self, interaction: discord.Interaction, error):
        ctx = InteractionContext(interaction)
        if isinstance(error, (app_commands.AppCommandError, commands.BadArgument)):
            await ctx.send(embed=make_embed(format_usage("/invitedlist", "[member or invite code]"), discord.Color.red()), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)


async def setup(bot: commands.Bot):
    await bot.add_cog(InvitedListCommand(bot))