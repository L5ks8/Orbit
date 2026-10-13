import discord
from discord.ext import commands
from Components.Commands._utils import format_usage, make_embed, make_v2_card, ORBIT_COLOR, InteractionContext
from Components.emojis import Emojis


class InviteCodesCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @app_commands.command(name="invitecodes", description="Displays all invite code(s) for you or the mentioned member.")
    async def invitecodes(self, interaction: discord.Interaction, member: discord.Member = None):
        ctx = InteractionContext(interaction)
        await ctx.defer()
        target = member or ctx.author

        try:
            guild_invites = await ctx.guild.invites()
        except discord.Forbidden:
            return await ctx.send(embed=make_embed("I do not have permission to view invites.", discord.Color.red()), ephemeral=True)

        user_invites = [inv for inv in guild_invites if inv.inviter and inv.inviter.id == target.id]

        if not user_invites:
            desc = f"{target.mention} has no active invite codes."
            footer = None
        else:
            lines = []
            for inv in user_invites[:25]:
                expires = "Never" if inv.max_age == 0 else f"<t:{int(inv.created_at.timestamp()) + inv.max_age}:R>"
                max_uses = "∞" if inv.max_uses == 0 else str(inv.max_uses)
                lines.append(
                    f"`{inv.code}` — **{inv.uses}**/{max_uses} uses — Expires: {expires}"
                )
            desc = f"**Invite codes for {target.mention}:**\n\n" + "\n".join(lines)
            if len(user_invites) > 25:
                footer = f"Showing 25 of {len(user_invites)} invite codes"
            elif ctx.guild:
                footer = ctx.guild.name
            else:
                footer = None

        card = make_v2_card(f"# Invite Codes\n\n{desc}", color=ORBIT_COLOR, footer=footer)
        if card:
            return await ctx.send(view=card, allowed_mentions=discord.AllowedMentions.none())

        embed = discord.Embed(
            title="Invite Codes",
            description=desc,
            color=ORBIT_COLOR
        )
        embed.set_thumbnail(url=target.display_avatar.url if hasattr(target, "display_avatar") else None)
        if footer:
            embed.set_footer(text=footer)
        await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())

    @invitecodes.error
    async def invitecodes_error(self, interaction: discord.Interaction, error):
        ctx = InteractionContext(interaction)
        if isinstance(error, (app_commands.AppCommandError, commands.BadArgument)):
            await ctx.send(embed=make_embed(format_usage("/invitecodes", "[member]"), discord.Color.red()), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)


async def setup(bot: commands.Bot):
    await bot.add_cog(InviteCodesCommand(bot))