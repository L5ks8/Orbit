import discord
from discord import app_commands
from discord.ext import commands

from Components.Commands._utils import make_embed, InteractionContext, ORBIT_COLOR
from Components.Systems.Verify._storage import load_verify_config, remove_pending_kick
from Components.Systems.Verify._views import CAPTCHA_SESSIONS

async def _do_verify_user(ctx: commands.Context, member: discord.Member):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send(embed=make_embed("This command must be run inside a server.", discord.Color.red()), ephemeral=True)

    config = load_verify_config(ctx.guild.id)
    role_id = config.get("role_id")
    remove_role_id = config.get("remove_role_id")

    if not role_id:
        return await ctx.send(embed=make_embed("Server verification is currently misconfigured (`Verified role not set`). Please run `/verify setup` first.", discord.Color.red()), ephemeral=True)

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

        embed = discord.Embed(color=ORBIT_COLOR)
        embed.set_author(name=member.display_name, icon_url=member.display_avatar.url)
        embed.title = "Manual Verification"
        embed.add_field(name="User", value=f"{member.mention} (`{member.id}`)", inline=True)
        embed.add_field(name="Granted Role", value=role.mention, inline=True)
        embed.add_field(name="Verified By", value=ctx.author.mention, inline=True)
        if remove_role:
            embed.add_field(name="Removed Role", value=remove_role.mention, inline=True)

        await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())

    except discord.Forbidden:
        await ctx.send(embed=make_embed(f"I do not have permission to modify roles for {member.mention}. Please check my role hierarchy.", discord.Color.red()), ephemeral=True)
    except Exception as e:
        await ctx.send(embed=make_embed(f"An error occurred manually verifying {member.mention}: {e}", discord.Color.red()), ephemeral=True)

class VerifyUserCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @app_commands.command(name="manualverify", description="Manually verify a member.")
    @app_commands.describe(member="The member to manually verify")
    @app_commands.default_permissions(manage_guild=True)
    async def verify_cmd(self, interaction: discord.Interaction, member: discord.Member):
        ctx = InteractionContext(interaction)
        await _do_verify_user(ctx, member)

async def setup(bot: commands.Bot):
    await bot.add_cog(VerifyUserCog(bot))
