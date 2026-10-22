import asyncio
import pathlib
import discord
from discord import app_commands
from discord.ext import commands
from typing import Optional, Literal

from Components.Commands._utils import make_embed, ORBIT_COLOR, InteractionContext
from Components.emojis import Emojis
from Components.Systems.Verify._storage import (
    load_verify_config,
    save_verify_config,
    remove_pending_kick,
    DEFAULT_VERIFY_TITLE,
    DEFAULT_VERIFY_DESC,
    DEFAULT_VERIFY_COLOR,
    DEFAULT_VERIFY_IMAGE
)
from Components.Systems.Verify._views import (
    PersistentVerifyLayout,
    handle_verify_interaction,
    CAPTCHA_SESSIONS
)

def _get_default_verify_image_path() -> Optional[pathlib.Path]:
    candidates = [
        pathlib.Path("Website/static/img/default_verify.png"),
        pathlib.Path(__file__).resolve().parent.parent.parent.parent / "Website" / "static" / "img" / "default_verify.png",
        pathlib.Path("Website/frontend/public/img/default_verify.png"),
        pathlib.Path("Website/frontend/dist/img/default_verify.png"),
        pathlib.Path(__file__).resolve().parent.parent.parent.parent / "Website" / "frontend" / "public" / "img" / "default_verify.png",
        pathlib.Path(__file__).resolve().parent.parent.parent.parent / "Website" / "frontend" / "dist" / "img" / "default_verify.png",
    ]
    return next((p for p in candidates if p.exists()), None)


class VerificationCog(commands.Cog, name="Verification"):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    verify_group = app_commands.Group(name="verify", description="Verify members manually or configure server verification.")

    @verify_group.command(name="panel", description="Deploy the verification panel with the standard banner and button.")
    @app_commands.describe(channel="The channel where the verification embed should be sent (defaults to current channel).")
    @app_commands.checks.has_permissions(manage_guild=True)
    async def panel(self, interaction: discord.Interaction, channel: Optional[discord.TextChannel] = None):
        """Sends the verification panel to the designated channel."""
        ctx = InteractionContext(interaction)
        await ctx.defer(ephemeral=True)
        if not (ctx.author.guild_permissions.manage_guild or ctx.author.guild_permissions.administrator or ctx.author.id == ctx.guild.owner_id):
            return await ctx.send(embed=make_embed("You need `Manage Server` permission to deploy the verification panel.", discord.Color.red()), ephemeral=True)
        target_channel = channel or ctx.channel

        if not isinstance(target_channel, discord.TextChannel):
            return await ctx.send(embed=make_embed("Please choose a valid text channel for the verification panel.", discord.Color.red()), ephemeral=True)

        verify_cfg = load_verify_config(ctx.guild.id)
        role_id = verify_cfg.get("role_id")
        if not role_id:
            return await ctx.send(
                embed=make_embed(
                    f"**Verified Role Not Configured!**\n"
                    "Please configure a verified role first with `/verify setup` or via the web dashboard.",
                    discord.Color.gold()
                ),
                ephemeral=True
            )

        title = verify_cfg.get("embed_title") or DEFAULT_VERIFY_TITLE
        desc = verify_cfg.get("embed_description") or DEFAULT_VERIFY_DESC
        raw_color = verify_cfg.get("embed_color") or DEFAULT_VERIFY_COLOR
        try:
            color = discord.Color(int(str(raw_color).lstrip('#'), 16))
        except Exception:
            color=ORBIT_COLOR

        embed = discord.Embed(
            title=title,
            description=desc,
            color=color
        )

        emb_image = verify_cfg.get("embed_image") or DEFAULT_VERIFY_IMAGE
        local_img = _get_default_verify_image_path()
        file_to_send = None

        if (not emb_image or emb_image == DEFAULT_VERIFY_IMAGE or emb_image.startswith("/") or "default_verify" in emb_image) and local_img:
            file_to_send = discord.File(fp=str(local_img), filename="verify_banner.png")
            embed.set_image(url="attachment://verify_banner.png")
        elif emb_image and emb_image.startswith("http") and "Web/static/default_verify.png" not in emb_image:
            embed.set_image(url=emb_image)
        elif local_img:
            file_to_send = discord.File(fp=str(local_img), filename="verify_banner.png")
            embed.set_image(url="attachment://verify_banner.png")

        view = PersistentVerifyLayout()
        send_kwargs = {
            "embed": embed,
            "view": view,
            "allowed_mentions": discord.AllowedMentions.none()
        }
        if file_to_send:
            send_kwargs["file"] = file_to_send

        try:
            await target_channel.send(**send_kwargs)
            
            verify_cfg["channel_id"] = target_channel.id
            verify_cfg["enabled"] = True
            save_verify_config(ctx.guild.id, verify_cfg)

            await ctx.send(
                embed=make_embed(f" Verification panel successfully deployed to {target_channel.mention}!", ORBIT_COLOR),
                ephemeral=True
            )
        except discord.Forbidden:
            await ctx.send(
                embed=make_embed(f"I do not have permission to send messages and embed links in {target_channel.mention}.", discord.Color.red()),
                ephemeral=True
            )
        except Exception as e:
            await ctx.send(
                embed=make_embed(f"Failed to send verification panel: {e}", discord.Color.red()),
                ephemeral=True
            )

    @verify_group.command(name="setup", description="Configure the verified role, optional unverified role, and mode.")
    @app_commands.describe(
        role="The role granted to users once verified.",
        remove_role="Optional unverified role to remove upon verification.",
        mode="Verification security type (captcha, oneclick, web_captcha)."
    )
    @app_commands.checks.has_permissions(manage_guild=True)
    async def setup_cmd(
        self,
        interaction: discord.Interaction,
        role: discord.Role,
        remove_role: Optional[discord.Role] = None,
        mode: Literal["captcha", "oneclick", "web_captcha"] = "captcha"
    ):
        """Configures verification roles and verification type."""
        ctx = InteractionContext(interaction)
        await ctx.defer(ephemeral=True)

        if not (ctx.author.guild_permissions.manage_guild or ctx.author.guild_permissions.administrator or ctx.author.id == ctx.guild.owner_id):
            return await ctx.send(embed=make_embed("You need `Manage Server` permission to configure verification.", discord.Color.red()), ephemeral=True)

        if ctx.guild.me.top_role <= role:
            return await ctx.send(
                embed=make_embed(
                    f"Warning: My bot role is lower than {role.mention} in the server hierarchy.\n"
                    "Please drag my role above the verified role in **Server Settings -> Roles**.",
                    discord.Color.gold()
                ),
                ephemeral=True
            )

        verify_cfg = load_verify_config(ctx.guild.id)
        verify_cfg["role_id"] = role.id
        verify_cfg["remove_role_id"] = remove_role.id if remove_role else None
        verify_cfg["verification_type"] = mode
        verify_cfg["enabled"] = True
        save_verify_config(ctx.guild.id, verify_cfg)

        msg = (
            f"**Verification Configured Successfully!**\n\n"
            f"• **Verified Role:** {role.mention}\n"
            f"• **Remove Role:** {remove_role.mention if remove_role else 'None'}\n"
            f"• **Mode:** `{mode}`\n\n"
            f"Deploy the panel anytime with `/verify panel`."
        )
        await ctx.send(embed=make_embed(msg, ORBIT_COLOR), ephemeral=True)

    @verify_group.command(name="status", description="Check current verification settings.")
    @app_commands.checks.has_permissions(manage_guild=True)
    async def status_cmd(self, interaction: discord.Interaction):
        """Displays current verification configuration."""
        ctx = InteractionContext(interaction)
        await ctx.defer(ephemeral=True)

        if not (ctx.author.guild_permissions.manage_guild or ctx.author.guild_permissions.administrator or ctx.author.id == ctx.guild.owner_id):
            return await ctx.send(embed=make_embed("You need `Manage Server` permission to view verification status.", discord.Color.red()), ephemeral=True)

        cfg = load_verify_config(ctx.guild.id)

        role = ctx.guild.get_role(cfg.get("role_id")) if cfg.get("role_id") else None
        rem_role = ctx.guild.get_role(cfg.get("remove_role_id")) if cfg.get("remove_role_id") else None
        channel = ctx.guild.get_channel(cfg.get("channel_id")) if cfg.get("channel_id") else None

        embed = discord.Embed(title="Server Verification Status", color=ORBIT_COLOR)
        embed.add_field(name="Status", value="Enabled" if cfg.get("enabled") else "Disabled", inline=True)
        embed.add_field(name="Mode", value=f"`{cfg.get('verification_type', 'captcha')}`", inline=True)
        embed.add_field(name="Channel", value=channel.mention if channel else "None configured", inline=True)
        embed.add_field(name="Verified Role", value=role.mention if role else "Not set", inline=True)
        embed.add_field(name="Remove Role", value=rem_role.mention if rem_role else "None", inline=True)
        
        timeout_act = cfg.get("timeout_action", "none")
        timeout_min = cfg.get("timeout_minutes", 0)
        embed.add_field(name="Timeout Action", value=f"`{timeout_act}` ({timeout_min}m)" if timeout_act != "none" else "None", inline=True)

        await ctx.send(embed=embed, ephemeral=True)

    @verify_group.command(name="user", description="Manually verify a server member.")
    @app_commands.describe(member="The member to manually verify")
    async def verify_user_cmd(self, interaction: discord.Interaction, member: discord.Member):
        """Manually verify a specific server member."""
        ctx = InteractionContext(interaction)
        await ctx.defer()
        if not ctx.guild:
            return await ctx.send(embed=make_embed("This command must be run inside a server.", discord.Color.red()), ephemeral=True)

        if not (ctx.author.guild_permissions.manage_roles or ctx.author.guild_permissions.manage_guild or ctx.author.id == ctx.guild.owner_id):
            return await ctx.send(embed=make_embed("You need `Manage Roles` or `Manage Server` permission to verify other members.", discord.Color.red()), ephemeral=True)

        config = load_verify_config(ctx.guild.id)
        raw_role_id = config.get("role_id")
        raw_remove_role_id = config.get("remove_role_id")

        if not raw_role_id:
            return await ctx.send(embed=make_embed("Server verification is currently misconfigured (`Verified role not set`). Please configure it with `/verify setup` first.", discord.Color.red()), ephemeral=True)

        try:
            role = ctx.guild.get_role(int(raw_role_id))
        except (ValueError, TypeError):
            role = None

        if not role:
            return await ctx.send(embed=make_embed("Server verification is currently misconfigured (`Verified role not found in server`).", discord.Color.red()), ephemeral=True)

        if role >= ctx.guild.me.top_role:
            return await ctx.send(embed=make_embed(f"I cannot assign {role.mention} because it is higher than or equal to my highest role. Please move my role above it in Server Settings -> Roles.", discord.Color.red()), ephemeral=True)

        if role >= ctx.author.top_role and ctx.author.id != ctx.guild.owner_id:
            return await ctx.send(embed=make_embed(f"You cannot assign {role.mention} because it is higher than or equal to your own top role.", discord.Color.red()), ephemeral=True)

        if role in member.roles:
            return await ctx.send(embed=make_embed(f"{member.mention} is already verified on this server!", discord.Color.red()), ephemeral=True)

        remove_role = None
        if raw_remove_role_id:
            try:
                remove_role = ctx.guild.get_role(int(raw_remove_role_id))
            except (ValueError, TypeError):
                remove_role = None

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

            embed = discord.Embed(title="Member Verified", color=ORBIT_COLOR)
            embed.set_author(name=member.display_name, icon_url=member.display_avatar.url)
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

    @verify_group.command(name="all", description="Manually verify all unverified members in the server.")
    async def verify_all_cmd(self, interaction: discord.Interaction):
        """Manually verify all unverified non-bot members in the server."""
        ctx = InteractionContext(interaction)
        await ctx.defer()
        if not ctx.guild:
            return await ctx.send(embed=make_embed("This command must be run inside a server.", discord.Color.red()), ephemeral=True)

        if not (ctx.author.guild_permissions.manage_guild or ctx.author.guild_permissions.administrator or ctx.author.id == ctx.guild.owner_id):
            return await ctx.send(embed=make_embed("You need `Manage Server` permission to verify all members.", discord.Color.red()), ephemeral=True)

        config = load_verify_config(ctx.guild.id)
        raw_role_id = config.get("role_id")
        raw_remove_role_id = config.get("remove_role_id")

        if not raw_role_id:
            return await ctx.send(embed=make_embed("Server verification is currently misconfigured (`Verified role not set`). Please configure it with `/verify setup` first.", discord.Color.red()), ephemeral=True)

        try:
            role = ctx.guild.get_role(int(raw_role_id))
        except (ValueError, TypeError):
            role = None

        if not role:
            return await ctx.send(embed=make_embed("Server verification is currently misconfigured (`Verified role not found in server`).", discord.Color.red()), ephemeral=True)

        if role >= ctx.guild.me.top_role:
            return await ctx.send(embed=make_embed(f"I cannot assign {role.mention} because it is higher than or equal to my highest role. Please move my role above it in Server Settings -> Roles.", discord.Color.red()), ephemeral=True)

        if role >= ctx.author.top_role and ctx.author.id != ctx.guild.owner_id:
            return await ctx.send(embed=make_embed(f"You cannot assign {role.mention} because it is higher than or equal to your own top role.", discord.Color.red()), ephemeral=True)

        remove_role = None
        if raw_remove_role_id:
            try:
                remove_role = ctx.guild.get_role(int(raw_remove_role_id))
            except (ValueError, TypeError):
                remove_role = None

        if not ctx.guild.chunked:
            try:
                await ctx.guild.chunk()
            except Exception:
                pass

        members_to_verify = [m for m in ctx.guild.members if not m.bot and role not in m.roles]
        if not members_to_verify:
            return await ctx.send(embed=make_embed("All non-bot members in this server are already verified!", ORBIT_COLOR), ephemeral=True)

        total_members = len(members_to_verify)
        if total_members > 15:
            await ctx.send(embed=make_embed(f"Starting mass verification for `{total_members}` members... Please wait.", ORBIT_COLOR))

        verified_count = 0
        failed_count = 0

        for idx, member in enumerate(members_to_verify, start=1):
            try:
                await member.add_roles(role, reason=f"Mass manual verification by {ctx.author}")
                if remove_role and remove_role in member.roles:
                    try:
                        await member.remove_roles(remove_role, reason=f"Removed after mass verification by {ctx.author}")
                    except Exception:
                        pass
                remove_pending_kick(ctx.guild.id, member.id)
                if member.id in CAPTCHA_SESSIONS:
                    del CAPTCHA_SESSIONS[member.id]
                verified_count += 1
            except discord.Forbidden:
                failed_count += 1
            except Exception:
                failed_count += 1

            if total_members > 15 and idx % 20 == 0:
                try:
                    await ctx.edit_original_response(embed=make_embed(f"Verifying members... `{idx}/{total_members}` processed.", ORBIT_COLOR))
                except Exception:
                    pass

            if total_members > 10:
                await asyncio.sleep(0.25)

        embed = discord.Embed(title="Mass Verification Complete", color=ORBIT_COLOR)
        embed.add_field(name="Newly Verified", value=f"`{verified_count}` members", inline=True)
        if failed_count:
            embed.add_field(name="Failed (Permissions)", value=f"`{failed_count}` members", inline=True)
        embed.add_field(name="Role Granted", value=role.mention, inline=True)
        embed.add_field(name="Moderator", value=ctx.author.mention, inline=True)
        if remove_role:
            embed.add_field(name="Removed Role", value=remove_role.mention, inline=True)

        try:
            await ctx.edit_original_response(embed=embed)
        except Exception:
            await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())

    @verify_group.command(name="me", description="Start verification to access the server.")
    async def verify_me_cmd(self, interaction: discord.Interaction):
        """Direct verify command for users."""
        await handle_verify_interaction(interaction)


async def setup(bot: commands.Bot):
    await bot.add_cog(VerificationCog(bot))

