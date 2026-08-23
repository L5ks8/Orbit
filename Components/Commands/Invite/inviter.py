import discord
from discord.ext import commands
from Components.Commands.Invite._storage import get_invite_info
from Components.Commands._utils import format_usage, make_embed


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

        embed = discord.Embed(
            title="Inviter",
            color=discord.Color.blurple()
        )
        embed.set_thumbnail(url=target.display_avatar.url if target else None)

        if inviter_user:
            embed.description = (
                f"**Member:** {target.mention}\n"
                f"**Invited by:** {inviter_user.mention}\n"
                f"**Invite Code:** `{code or 'Unknown'}`"
            )
        else:
            embed.description = f"No invite data found for {target.mention}."

        if ctx.guild:
            embed.set_footer(text=ctx.guild.name, icon_url=ctx.guild.icon.url if ctx.guild.icon else None)

        await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())

    @inviter.error
    async def inviter_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingRequiredArgument):
            await ctx.send(embed=make_embed(format_usage("-inviter", "<member>"), discord.Color.red()), ephemeral=True)
        elif isinstance(error, commands.BadArgument):
            await ctx.send(embed=make_embed(format_usage("-inviter", "<member>"), discord.Color.red()), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)


async def setup(bot: commands.Bot):
    await bot.add_cog(InviterCommand(bot))