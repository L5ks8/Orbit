import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Commands.Whitelist._storage import is_whitelisted
from Commands.Mute._storage import get_muted_role_id, set_muted_role_id
from Commands.Log._storage import log_event


async def get_or_create_muted_role(guild: discord.Guild) -> discord.Role:
    stored_id = get_muted_role_id(guild.id)
    if stored_id:
        role = guild.get_role(stored_id)
        if role:
            return role

    role = discord.utils.get(guild.roles, name="Muted")
    if not role:
        role = await guild.create_role(name="Muted", reason="Orbit Mute Role")

    set_muted_role_id(guild.id, role.id)
    return role


class MuteSuccessLayout(LayoutView):
    def __init__(self, target: discord.Member, reason: str, author: discord.Member, channels_count: int):
        super().__init__()
        self.container = Container(
            TextDisplay(content=f"### User Muted\n**Target:** {target.mention} (`{target.id}`)"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Reason:** {reason}\n**Moderator:** {author.mention}\n**Channel Overrides:** User permissions disabled in `{channels_count}` channel(s).")
        )
        self.add_item(self.container)


class MuteCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="mute", description="Mutes a user.")
    @commands.has_permissions(manage_roles=True)
    @commands.bot_has_permissions(manage_roles=True, manage_channels=True)
    async def mute(self, ctx: commands.Context, target: discord.Member, *, reason: str = "No reason provided"):
        await ctx.defer()
        if target.id == ctx.author.id:
            return await ctx.send("You cannot mute yourself.", ephemeral=True)
        if is_whitelisted(ctx.guild.id, target.id):
            return await ctx.send("This user is on the global moderation whitelist (`Immune to Mute`).", ephemeral=True)
        if target.top_role >= ctx.author.top_role and ctx.author != ctx.guild.owner:
            return await ctx.send("You cannot mute a user with an equal or higher role.", ephemeral=True)

        role = await get_or_create_muted_role(ctx.guild)
        if role in target.roles:
            return await ctx.send("This user is already muted.", ephemeral=True)

        try:
            await target.add_roles(role, reason=f"Muted by {ctx.author} | Reason: {reason}")
        except discord.Forbidden:
            return await ctx.send("I do not have permissions to manage roles or my role is lower than the Muted role.", ephemeral=True)
        except Exception as e:
            return await ctx.send(f"Error assigning muted role: {e}", ephemeral=True)

        channels_affected = 0
        for channel in ctx.guild.channels:
            try:
                if isinstance(channel, (discord.TextChannel, discord.VoiceChannel, discord.StageChannel, discord.ForumChannel)):
                    await channel.set_permissions(
                        target,
                        send_messages=False,
                        send_messages_in_threads=False,
                        create_public_threads=False,
                        create_private_threads=False,
                        add_reactions=False,
                        speak=False,
                        connect=False,
                        reason=f"Muted by {ctx.author}: {reason}"
                    )
                    channels_affected += 1
            except Exception:
                pass

        view = MuteSuccessLayout(target, reason, ctx.author, channels_affected)
        await log_event(
            ctx.guild,
            "moderation",
            "User Muted (`-mute`)",
            f"**Target:** {target.mention} (`{target.id}`)\n**Moderator:** {ctx.author.mention} (`{ctx.author.id}`)\n**Reason:** {reason}\n**Affected Channels:** `{channels_affected}`"
        )
        await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

    @mute.error
    async def mute_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need Manage Roles permission to mute users.", ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send("Usage: -mute <@user/ID> [reason]", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)


async def setup(bot: commands.Bot):
    await bot.add_cog(MuteCommand(bot))
