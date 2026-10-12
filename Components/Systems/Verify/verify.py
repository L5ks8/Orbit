import pathlib
import discord
from discord import app_commands
from discord.ext import commands
from typing import Optional, Literal

from Components.Commands._utils import make_embed, ORBIT_COLOR
from Components.emojis import Emojis
from Components.Systems.Verify._storage import (
    load_verify_config,
    save_verify_config,
    DEFAULT_VERIFY_TITLE,
    DEFAULT_VERIFY_DESC,
    DEFAULT_VERIFY_COLOR,
    DEFAULT_VERIFY_IMAGE
)
from Components.Systems.Verify._views import (
    PersistentVerifyLayout,
    handle_verify_interaction
)

def _get_default_verify_image_path() -> Optional[pathlib.Path]:
    candidates = [
        pathlib.Path("Website/frontend/public/img/default_verify.png"),
        pathlib.Path("Website/frontend/dist/img/default_verify.png"),
        pathlib.Path(__file__).resolve().parent.parent.parent.parent / "Website" / "frontend" / "public" / "img" / "default_verify.png",
        pathlib.Path(__file__).resolve().parent.parent.parent.parent / "Website" / "frontend" / "dist" / "img" / "default_verify.png",
    ]
    return next((p for p in candidates if p.exists()), None)


class VerificationCog(commands.Cog, name="Verification"):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_group(name="verification", description="Manage and deploy server verification.", invoke_without_command=True)
    @commands.has_permissions(manage_guild=True)
    async def verification(self, ctx: commands.Context):
        """Root command for server verification settings."""
        if ctx.invoked_subcommand is None:
            embed = make_embed(
                f"{Emojis.VERIFICATION} **Verification System Commands**\n\n"
                "• `/verification panel [channel]` - Deploy the official verification panel\n"
                "• `/verification setup [role] [remove_role] [mode]` - Configure verification roles and mode\n"
                "• `/verification status` - View current verification configuration\n"
                "• `/verify` - Verify your account directly",
                discord.Color.blurple()
            )
            await ctx.send(embed=embed, ephemeral=True)

    @verification.command(name="panel", description="Deploy the verification panel with the standard banner and button.")
    @app_commands.describe(channel="The channel where the verification embed should be sent (defaults to current channel).")
    @commands.has_permissions(manage_guild=True)
    async def panel(self, ctx: commands.Context, channel: Optional[discord.TextChannel] = None):
        """Sends the verification panel to the designated channel."""
        await ctx.defer(ephemeral=True)
        target_channel = channel or ctx.channel

        if not isinstance(target_channel, discord.TextChannel):
            return await ctx.send(embed=make_embed("Please choose a valid text channel for the verification panel.", discord.Color.red()), ephemeral=True)

        verify_cfg = load_verify_config(ctx.guild.id)
        role_id = verify_cfg.get("role_id")
        if not role_id:
            return await ctx.send(
                embed=make_embed(
                    f"{Emojis.WARNING} **Verified Role Not Configured!**\n"
                    "Please configure a verified role first with `/verification setup` or via the web dashboard.",
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
                embed=make_embed(f" Verification panel successfully deployed to {target_channel.mention}!", discord.Color.green()),
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

    @verification.command(name="setup", description="Configure the verified role, optional unverified role, and mode.")
    @app_commands.describe(
        role="The role granted to users once verified.",
        remove_role="Optional unverified role to remove upon verification.",
        mode="Verification security type (captcha, oneclick, web_captcha)."
    )
    @commands.has_permissions(manage_guild=True)
    async def setup_cmd(
        self,
        ctx: commands.Context,
        role: discord.Role,
        remove_role: Optional[discord.Role] = None,
        mode: Literal["captcha", "oneclick", "web_captcha"] = "captcha"
    ):
        """Configures verification roles and verification type."""
        await ctx.defer(ephemeral=True)

        if ctx.guild.me.top_role <= role:
            return await ctx.send(
                embed=make_embed(
                    f"{Emojis.WARNING} Warning: My bot role is lower than {role.mention} in the server hierarchy.\n"
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
            f"Deploy the panel anytime with `/verification panel`."
        )
        await ctx.send(embed=make_embed(msg, discord.Color.green()), ephemeral=True)

    @verification.command(name="status", description="Check current verification settings.")
    @commands.has_permissions(manage_guild=True)
    async def status_cmd(self, ctx: commands.Context):
        """Displays current verification configuration."""
        await ctx.defer(ephemeral=True)
        cfg = load_verify_config(ctx.guild.id)

        role = ctx.guild.get_role(cfg.get("role_id")) if cfg.get("role_id") else None
        rem_role = ctx.guild.get_role(cfg.get("remove_role_id")) if cfg.get("remove_role_id") else None
        channel = ctx.guild.get_channel(cfg.get("channel_id")) if cfg.get("channel_id") else None

        embed = discord.Embed(title=f"{Emojis.VERIFICATION} Server Verification Status", color=ORBIT_COLOR)
        embed.add_field(name="Status", value="Enabled" if cfg.get("enabled") else f"{Emojis.NO_ENTRY} Disabled", inline=True)
        embed.add_field(name="Mode", value=f"`{cfg.get('verification_type', 'captcha')}`", inline=True)
        embed.add_field(name="Channel", value=channel.mention if channel else "None configured", inline=True)
        embed.add_field(name="Verified Role", value=role.mention if role else "Not set", inline=True)
        embed.add_field(name="Remove Role", value=rem_role.mention if rem_role else "None", inline=True)
        
        timeout_act = cfg.get("timeout_action", "none")
        timeout_min = cfg.get("timeout_minutes", 0)
        embed.add_field(name="Timeout Action", value=f"`{timeout_act}` ({timeout_min}m)" if timeout_act != "none" else "None", inline=True)

        await ctx.send(embed=embed, ephemeral=True)

    @commands.hybrid_command(name="verify", description="Start verification to access the server.")
    async def verify_command(self, ctx: commands.Context):
        """Direct verify command for users."""
        if ctx.interaction:
            await handle_verify_interaction(ctx.interaction)
        else:
            embed = make_embed("Please use `/verify` slash command or click the Verify button on the verification panel.", discord.Color.blurple())
            await ctx.send(embed=embed, ephemeral=True)


async def setup(bot: commands.Bot):
    await bot.add_cog(VerificationCog(bot))
