import discord
from discord.ext import commands
from Components.Commands.Invite._storage import get_invite_info
from Components.Commands._utils import format_usage, make_embed, make_v2_card, ORBIT_COLOR
from Components.emojis import Emojis


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

        if inviter_user:
            desc = (
                f"**Member:** {target.mention}\n"
                f"**Invited by:** {inviter_user.mention}\n"
                f"**Invite Code:** `{code or 'Unknown'}`"
            )
        else:
            desc = f"No invite data found for {target.mention}."

        footer_text = ctx.guild.name if ctx.guild else None
        card = make_v2_card(f"# {Emojis.MAIL} Inviter\n\n{desc}", color=ORBIT_COLOR, footer=footer_text)
        if card:
            return await ctx.send(view=card, allowed_mentions=discord.AllowedMentions.none())

        embed = discord.Embed(
            title=f"{Emojis.MAIL} Inviter",
            description=desc,
            color=ORBIT_COLOR
        )
        embed.set_thumbnail(url=target.display_avatar.url if target else None)
        if footer_text:
            embed.set_footer(text=footer_text, icon_url=ctx.guild.icon.url if ctx.guild.icon else None)

        await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())

    @inviter.error
    async def inviter_error(self, ctx: commands.Context, error):
        if isinstance(error, (commands.MissingRequiredArgument, commands.BadArgument)):
            await ctx.send(embed=make_embed(format_usage("/inviter", "<member>"), discord.Color.red()), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)


async def setup(bot: commands.Bot):
    await bot.add_cog(InviterCommand(bot))