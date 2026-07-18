utf-8import discord
from discord import app_commands
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Commands.Verify._storage import load_verify_config, remove_pending_kick
from Commands.Verify._views import CAPTCHA_SESSIONS
from Commands.Verify.verify import verify_group

async def _do_verify_user(ctx: commands.Context, member: discord.Member):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)

    config = load_verify_config(ctx.guild.id)
    role_id = config.get("role_id")
    remove_role_id = config.get("remove_role_id")

    if not role_id:
        return await ctx.send("Server verification is currently misconfigured (`Verified role not set`). Please run `-verify setup` first.", ephemeral=True)

    role = ctx.guild.get_role(role_id)
    if not role:
        return await ctx.send("Server verification is currently misconfigured (`Verified role not found in server`).", ephemeral=True)

    if any(r.id == role_id for r in getattr(member, 'roles', [])):
        return await ctx.send(f"{member.mention} is already verified on this server!", ephemeral=True)

    remove_role = ctx.guild.get_role(remove_role_id) if remove_role_id else None

    try:
        await member.add_roles(role, reason=f"Manually verified by {ctx.author}")
        if remove_role and remove_role in member.roles:
            try:
                await member.remove_roles(remove_role, reason=f"Removed after manual verification by {ctx.author}")
            except Exception:
                pass

        remove_pending_kick(ctx.guild.id, member.id)
        if member.id in CAPTCHA_SESSIONS:
            del CAPTCHA_SESSIONS[member.id]

        header_str = f"### Manual Verification: **{member.display_name}**\n**Status:** Verified"
        info_str = (
            f"**User:** {member.mention} (`{member.id}`)\n"
            f"**Granted Role:** {role.mention}\n"
            f"**Verified By:** {ctx.author.mention}"
        )
        if remove_role:
            info_str += f"\n**Removed Role:** {remove_role.mention}"

        container = Container(
            TextDisplay(content=header_str),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=info_str)
        )
        status_view = LayoutView()
        status_view.add_item(container)
        await ctx.send(view=status_view, allowed_mentions=discord.AllowedMentions.none())

    except discord.Forbidden:
        await ctx.send(f"I do not have permission to modify roles for {member.mention}. Please check my role hierarchy.", ephemeral=True)
    except Exception as e:
        await ctx.send(f"An error occurred manually verifying {member.mention}: {e}", ephemeral=True)

@verify_group.command(name="user", description="Manually verify a member.")
@commands.has_permissions(manage_guild=True)
@app_commands.describe(member="The member to manually verify")
async def user_cmd(ctx: commands.Context, member: discord.Member):
    await _do_verify_user(ctx, member)

class VerifyUserCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @user_cmd.error
    async def user_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need Manage Server permission to manually verify members.", ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send("Usage: `-verify user <@member>`", ephemeral=True)
        elif isinstance(error, (commands.MemberNotFound, commands.BadArgument)):
            await ctx.send("Member not found in this server.", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

class VerifyUserFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="vf_user", aliases=["verifyuser"], hidden=True)
    @commands.has_permissions(manage_guild=True)
    async def user_prefix(self, ctx: commands.Context, member: discord.Member):
        await _do_verify_user(ctx, member)

async def setup(bot: commands.Bot):
    from Commands.Verify.verify import verify_group
    if "verify" not in bot.all_commands:
        bot.add_command(verify_group)
    await bot.add_cog(VerifyUserCog(bot))
    await bot.add_cog(VerifyUserFallback(bot))
