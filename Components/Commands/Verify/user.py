import discord
from discord import app_commands
from discord.ext import commands

from Components.Commands._utils import make_embed
from discord.ui import Container, TextDisplay, Separator, LayoutView
from Components.Commands.Verify._storage import load_verify_config, remove_pending_kick
from Components.Commands.Verify._views import CAPTCHA_SESSIONS

async def _do_verify_user(ctx: commands.Context, member: discord.Member):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send(embed=make_embed("This command must be run inside a server.", discord.Color.red()), ephemeral=True)

    config = load_verify_config(ctx.guild.id)
    role_id = config.get("role_id")
    remove_role_id = config.get("remove_role_id")

    if not role_id:
        return await ctx.send(embed=make_embed("Server verification is currently misconfigured (`Verified role not set`). Please run `-verify setup` first.", discord.Color.red()), ephemeral=True)

    role = ctx.guild.get_role(role_id)
    if not role:
        return await ctx.send(embed=make_embed("Server verification is currently misconfigured (`Verified role not found in server`).", discord.Color.red()), ephemeral=True)

    if any(r.id == role_id for r in getattr(member, 'roles', [])):
        return await ctx.send(embed=make_embed(f"{member.mention} is already verified on this server!", discord.Color.red()), ephemeral=True)

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
        await ctx.send(embed=make_embed(f"I do not have permission to modify roles for {member.mention}. Please check my role hierarchy.", discord.Color.red()), ephemeral=True)
    except Exception as e:
        await ctx.send(embed=make_embed(f"An error occurred manually verifying {member.mention}: {e}", discord.Color.red()), ephemeral=True)

class VerifyUserCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="verify", description="Manually verify a member.")
    @commands.has_permissions(manage_guild=True)
    @app_commands.describe(member="The member to manually verify")
    async def verify_cmd(self, ctx: commands.Context, member: discord.Member):
        await _do_verify_user(ctx, member)

    @verify_cmd.error
    async def verify_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send(embed=make_embed("You need Manage Server permission to manually verify members.", discord.Color.red()), ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send(embed=make_embed("Usage: `-verify <@member>`", discord.Color.red()), ephemeral=True)
        elif isinstance(error, (commands.MemberNotFound, commands.BadArgument)):
            await ctx.send(embed=make_embed("Member not found in this server.", discord.Color.red()), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(VerifyUserCog(bot))
