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

        embed = discord.Embed(
            title="Invite Codes",
            color=discord.Color.blurple()
        )
        embed.set_thumbnail(url=target.display_avatar.url if hasattr(target, "display_avatar") else None)

        if not user_invites:
            embed.description = f"{target.mention} has no active invite codes."
        else:
            lines = []
            for inv in user_invites[:25]:
                expires = "Never" if inv.max_age == 0 else f"<t:{int(inv.created_at.timestamp()) + inv.max_age}:R>"
                max_uses = "∞" if inv.max_uses == 0 else str(inv.max_uses)
                lines.append(
                    f"`{inv.code}` — **{inv.uses}**/{max_uses} uses — Expires: {expires}"
                )
            embed.description = f"**Invite codes for {target.mention}:**\n\n" + "\n".join(lines)
            if len(user_invites) > 25:
                embed.set_footer(text=f"Showing 25 of {len(user_invites)} invite codes")
            elif ctx.guild:
                embed.set_footer(text=ctx.guild.name, icon_url=ctx.guild.icon.url if ctx.guild.icon else None)

        await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())

    @invitecodes.error
    async def invitecodes_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.BadArgument):
            await ctx.send(format_usage("-invitecodes", "[member]"), ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)


async def setup(bot: commands.Bot):
    await bot.add_cog(InviteCodesCommand(bot))
