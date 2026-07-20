import discord
from discord.ext import commands
from discord.ui import Container, TextDisplay, Separator
from Commands.Log._storage import log_event



class UntimeoutCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="untimeout", description="Removes an active timeout from a user.")
    @commands.has_permissions(moderate_members=True)
    @commands.bot_has_permissions(moderate_members=True)
    async def untimeout(self, ctx: commands.Context, target: discord.Member, *, reason: str = "No reason provided"):
        await ctx.defer()
        if not target.is_timed_out():
            return await ctx.send("This user is not currently timed out.", ephemeral=True)

        try:
            await target.timeout(None, reason=f"Timeout removed by {ctx.author} | Reason: {reason}")
            await log_event(
                ctx.guild,
        "moderation_action",
                "User Timeout Removed (`-untimeout`)",
                f"**Target:** {target.mention} (`{target.id}`)\n**Moderator:** {ctx.author.mention} (`{ctx.author.id}`)\n**Reason:** {reason}"
            )
            from Embeds import get_command_embed
            kwargs = get_command_embed(ctx.guild.id, "timeout", msg_type="untimeout", member_mention=target.mention, member_id=target.id, reason=reason, author_mention=ctx.author.mention)
            await ctx.send(**kwargs, allowed_mentions=discord.AllowedMentions.none())
        except discord.Forbidden:
            await ctx.send("I do not have sufficient permissions to remove the timeout.", ephemeral=True)
        except Exception as e:
            await ctx.send(f"Error removing timeout: {e}", ephemeral=True)

    @untimeout.error
    async def untimeout_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need Moderate Members permission to remove timeouts.", ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send("Usage: -untimeout <@user/ID> [reason]", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(UntimeoutCommand(bot))

