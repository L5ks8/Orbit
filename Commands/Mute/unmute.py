import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Commands.Mute._storage import get_muted_role_id
from Commands.Mute.mute import get_or_create_muted_role
from Commands.Log._storage import log_event


class UnmuteSuccessLayout(LayoutView):
    def __init__(self, target: discord.Member, reason: str, author: discord.Member, channels_restored: int):
        super().__init__()
        self.container = Container(
            TextDisplay(content=f"### User Unmuted\n**Target:** {target.mention} (`{target.id}`)"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Reason:** {reason}\n**Moderator:** {author.mention}\n**Channel Overrides:** User permissions restored in `{channels_restored}` channel(s).")
        )
        self.add_item(self.container)


class UnmuteCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="unmute", description="Removes the Muted role from a user.")
    @commands.has_permissions(manage_roles=True)
    @commands.bot_has_permissions(manage_roles=True, manage_channels=True)
    async def unmute(self, ctx: commands.Context, target: discord.Member, *, reason: str = "No reason provided"):
        await ctx.defer()
        role = await get_or_create_muted_role(ctx.guild)
        if not role or role not in target.roles:
            return await ctx.send("This user is not currently muted.", ephemeral=True)

        try:
            await target.remove_roles(role, reason=f"Unmuted by {ctx.author} | Reason: {reason}")
        except discord.Forbidden:
            return await ctx.send("I do not have permissions to remove the Muted role.", ephemeral=True)
        except Exception as e:
            return await ctx.send(f"Error removing muted role: {e}", ephemeral=True)

        channels_restored = 0
        for channel in ctx.guild.channels:
            try:
                if target in channel.overwrites:
                    await channel.set_permissions(
                        target,
                        overwrite=None,
                        reason=f"Unmuted by {ctx.author}: {reason}"
                    )
                    channels_restored += 1
            except Exception:
                pass

        view = UnmuteSuccessLayout(target, reason, ctx.author, channels_restored)
        await log_event(
            ctx.guild,
            "moderation",
            "User Unmuted (`-unmute`)",
            f"**Target:** {target.mention} (`{target.id}`)\n**Moderator:** {ctx.author.mention} (`{ctx.author.id}`)\n**Reason:** {reason}\n**Channels Restored:** `{channels_restored}`"
        )
        await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

    @unmute.error
    async def unmute_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need Manage Roles permission to unmute users.", ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send("Usage: -unmute <@user/ID> [reason]", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)


async def setup(bot: commands.Bot):
    await bot.add_cog(UnmuteCommand(bot))
