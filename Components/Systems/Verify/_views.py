import time
import io
import os
import discord
from discord.ui import Modal, TextInput, View, Button
from Components.Systems.Verify._storage import load_verify_config, remove_pending_kick
from Components.Systems.Verify._captcha import generate_captcha
from Components.Commands._utils import make_embed

CAPTCHA_SESSIONS = {}

class CaptchaInputModal(Modal, title="CAPTCHA Security Check"):
    code_input = TextInput(
        label="Enter the 5 connected characters:",
        placeholder="e.g. A8X3K",
        min_length=5,
        max_length=5,
        required=True
    )

    def __init__(self, role_id: int, remove_role_id: int = None):
        super().__init__()
        self.role_id = int(role_id) if role_id else None
        self.remove_role_id = int(remove_role_id) if remove_role_id else None

    async def on_submit(self, interaction: discord.Interaction):
        # Acknowledge immediately to avoid Discord 3s interaction timeouts
        await interaction.response.defer(ephemeral=True)

        if not interaction.guild or not isinstance(interaction.user, discord.Member):
            return await interaction.followup.send(embed=make_embed("Verification must be completed inside a server.", discord.Color.red()), ephemeral=True)

        if self.role_id and any(r.id == self.role_id for r in interaction.user.roles):
            return await interaction.followup.send(embed=make_embed("You are already verified on this server!", discord.Color.green()), ephemeral=True)

        session = CAPTCHA_SESSIONS.get(interaction.user.id)
        if not session or time.time() - session.get("timestamp", 0) > 600:
            return await interaction.followup.send(embed=make_embed("Your CAPTCHA session expired (> 10 minutes). Please click 'Request New CAPTCHA'.", discord.Color.red()), ephemeral=True)

        user_typed = self.code_input.value.strip().upper()
        expected = session.get("code", "").upper()

        if user_typed != expected:
            return await interaction.followup.send(embed=make_embed(f"**Incorrect CAPTCHA Code!** You entered `{user_typed}`.\nPlease click **Request New CAPTCHA** to try again.", discord.Color.red()), ephemeral=True)

        role = interaction.guild.get_role(self.role_id)
        if not role:
            return await interaction.followup.send(embed=make_embed("Configuration error: The verified role could not be found on this server.", discord.Color.red()), ephemeral=True)

        remove_role = interaction.guild.get_role(self.remove_role_id) if self.remove_role_id else None

        try:
            await interaction.user.add_roles(role, reason="Completed automated CAPTCHA verification")
            if remove_role and remove_role in interaction.user.roles:
                try:
                    await interaction.user.remove_roles(remove_role, reason="Removed after CAPTCHA verification")
                except Exception:
                    pass

            remove_pending_kick(interaction.guild.id, interaction.user.id)
            CAPTCHA_SESSIONS.pop(interaction.user.id, None)

            await interaction.followup.send(embed=make_embed(" You are now successfully verified on this server!", discord.Color.green()), ephemeral=True)
        except discord.Forbidden:
            await interaction.followup.send(embed=make_embed(f"I do not have permission to assign {role.mention}. Please ensure my bot role is higher than the verified role in Server Settings -> Roles.", discord.Color.red()), ephemeral=True)
        except Exception as e:
            await interaction.followup.send(embed=make_embed(f"An error occurred assigning the verified role: {e}", discord.Color.red()), ephemeral=True)


class CaptchaInteractionLayout(View):
    def __init__(self, role_id: int, remove_role_id: int = None):
        super().__init__(timeout=600)
        self.role_id = int(role_id) if role_id else None
        self.remove_role_id = int(remove_role_id) if remove_role_id else None

    @discord.ui.button(label="Enter CAPTCHA Code", style=discord.ButtonStyle.primary, emoji="⌨️")
    async def enter_code(self, interaction: discord.Interaction, button: Button):
        if not interaction.guild or not isinstance(interaction.user, discord.Member):
            return await interaction.response.send_message(embed=make_embed("Verification must be completed inside a server.", discord.Color.red()), ephemeral=True)

        if self.role_id and any(r.id == self.role_id for r in interaction.user.roles):
            return await interaction.response.send_message(embed=make_embed("You are already verified on this server!", discord.Color.green()), ephemeral=True)

        modal = CaptchaInputModal(self.role_id, self.remove_role_id)
        await interaction.response.send_modal(modal)

    @discord.ui.button(label="Request New CAPTCHA", style=discord.ButtonStyle.secondary, emoji="🔄")
    async def refresh_captcha(self, interaction: discord.Interaction, button: Button):
        if not interaction.guild or not isinstance(interaction.user, discord.Member):
            return await interaction.response.send_message(embed=make_embed("Verification must be completed inside a server.", discord.Color.red()), ephemeral=True)

        if self.role_id and any(r.id == self.role_id for r in interaction.user.roles):
            return await interaction.response.send_message(embed=make_embed("You are already verified on this server!", discord.Color.green()), ephemeral=True)

        await interaction.response.defer()

        code, img_bytes = generate_captcha()
        CAPTCHA_SESSIONS[interaction.user.id] = {"code": code, "timestamp": time.time()}

        filename = "captcha.bmp" if img_bytes[:2] == b"BM" else "captcha.png"
        file = discord.File(fp=io.BytesIO(img_bytes), filename=filename)

        new_view = CaptchaInteractionLayout(self.role_id, self.remove_role_id)
        embed = discord.Embed(
            title="Security Verification: Solve the CAPTCHA",
            description="Please look at the characters in the image below and click **Enter CAPTCHA Code** to type what you see.",
            color=discord.Color.blurple()
        )
        embed.set_image(url=f"attachment://{filename}")

        await interaction.edit_original_response(embed=embed, attachments=[file], view=new_view)


ACTIVE_INTERACTIONS = set()

async def handle_verify_interaction(interaction: discord.Interaction):
    """Central, resilient handler for the verify button click."""
    if interaction.id in ACTIVE_INTERACTIONS:
        return
    ACTIVE_INTERACTIONS.add(interaction.id)
    try:
        # Acknowledge immediately to avoid Discord 3s interaction timeouts
        if not interaction.response.is_done():
            try:
                await interaction.response.defer(ephemeral=True)
            except Exception:
                pass

        if not interaction.guild:
            return await interaction.followup.send(embed=make_embed("Verification must be completed inside a server.", discord.Color.red()), ephemeral=True)

        member = interaction.user if isinstance(interaction.user, discord.Member) else interaction.guild.get_member(interaction.user.id)
        if not member:
            try:
                member = await interaction.guild.fetch_member(interaction.user.id)
            except Exception:
                member = interaction.user

        config = load_verify_config(interaction.guild.id)
        if not config.get("enabled", True):
            return await interaction.followup.send(embed=make_embed("Server verification is currently disabled.", discord.Color.red()), ephemeral=True)

        raw_role_id = config.get("role_id")
        if not raw_role_id:
            return await interaction.followup.send(embed=make_embed("Server verification is currently misconfigured (`Verified role not set`). Please contact an administrator.", discord.Color.red()), ephemeral=True)

        try:
            role_id = int(raw_role_id)
        except (ValueError, TypeError):
            return await interaction.followup.send(embed=make_embed("Server verification has an invalid role configured. Please contact an administrator.", discord.Color.red()), ephemeral=True)

        role = interaction.guild.get_role(role_id)
        if not role:
            return await interaction.followup.send(embed=make_embed("Server verification is currently misconfigured (`Verified role not found in server`).", discord.Color.red()), ephemeral=True)

        # Check already verified
        if isinstance(member, discord.Member) and any(r.id == role_id for r in member.roles):
            return await interaction.followup.send(embed=make_embed("You are already verified on this server!", discord.Color.green()), ephemeral=True)

        # Role hierarchy check
        if interaction.guild.me.top_role <= role:
            return await interaction.followup.send(embed=make_embed(f"I cannot assign {role.mention} because my bot role is lower in the hierarchy. Please ask a server admin to move my role above the verified role in Server Settings -> Roles.", discord.Color.red()), ephemeral=True)

        raw_rem_role_id = config.get("remove_role_id")
        remove_role_id = None
        if raw_rem_role_id:
            try:
                remove_role_id = int(raw_rem_role_id)
            except (ValueError, TypeError):
                remove_role_id = None

        verification_type = config.get("verification_type", "captcha")

        # ONE-CLICK VERIFICATION
        if verification_type == "oneclick":
            remove_role = interaction.guild.get_role(remove_role_id) if remove_role_id else None
            try:
                await member.add_roles(role, reason="Completed automated One-Click verification")
                if remove_role and isinstance(member, discord.Member) and remove_role in member.roles:
                    try:
                        await member.remove_roles(remove_role, reason="Removed after One-Click verification")
                    except Exception:
                        pass

                remove_pending_kick(interaction.guild.id, member.id)
                await interaction.followup.send(embed=make_embed(" You are now successfully verified on this server!", discord.Color.green()), ephemeral=True)
            except discord.Forbidden:
                await interaction.followup.send(embed=make_embed(f"I do not have permission to modify roles for {role.mention}. Please check my role hierarchy.", discord.Color.red()), ephemeral=True)
            except Exception as e:
                await interaction.followup.send(embed=make_embed(f"An error occurred assigning the verified role: {e}", discord.Color.red()), ephemeral=True)
            return

        # WEB CAPTCHA
        elif verification_type == "web_captcha":
            try:
                import secrets
                token = secrets.token_urlsafe(16)
                from Components.Systems.Verify._storage import WEB_VERIFY_SESSIONS
                WEB_VERIFY_SESSIONS[token] = {
                    "user_id": member.id,
                    "guild_id": interaction.guild.id,
                    "role_id": role_id,
                    "remove_role_id": remove_role_id,
                    "timestamp": time.time()
                }

                base_url = (os.environ.get("BASE_URL") or "https://orbitbot.xyz").rstrip("/")
                verify_url = f"{base_url}/verify/{token}"

                view = View(timeout=600)
                view.add_item(Button(label="Open Verification Page", style=discord.ButtonStyle.link, url=verify_url, emoji="🌐"))

                embed = discord.Embed(
                    title="🛡️ Web Security Verification",
                    description=f"Please click the button below to solve the CAPTCHA in your browser.\n*This link is unique to you and will expire in 10 minutes.*\n\n[Privacy Policy]({base_url}/privacy) · [Support Server](https://discord.gg/wekuhwCsUg)",
                    color=discord.Color.blurple()
                )
                await interaction.followup.send(embed=embed, view=view, ephemeral=True)
            except Exception as e:
                await interaction.followup.send(embed=make_embed(f"Failed to generate verification panel: {e}", discord.Color.red()), ephemeral=True)
            return

        # DISCORD IMAGE CAPTCHA (DEFAULT)
        else:
            try:
                code, img_bytes = generate_captcha()
                CAPTCHA_SESSIONS[member.id] = {"code": code, "timestamp": time.time()}

                filename = "captcha.bmp" if img_bytes[:2] == b"BM" else "captcha.png"
                file = discord.File(fp=io.BytesIO(img_bytes), filename=filename)

                view = CaptchaInteractionLayout(role_id, remove_role_id)
                embed = discord.Embed(
                    title="🛡️ Security Verification: Solve the CAPTCHA",
                    description="Please look at the characters in the image below and click **Enter CAPTCHA Code** to type what you see.",
                    color=discord.Color.blurple()
                )
                embed.set_image(url=f"attachment://{filename}")

                await interaction.followup.send(embed=embed, file=file, view=view, ephemeral=True)
            except Exception as e:
                await interaction.followup.send(embed=make_embed(f"Failed to generate verification panel: {e}", discord.Color.red()), ephemeral=True)
    finally:
        ACTIVE_INTERACTIONS.discard(interaction.id)


class PersistentVerifyLayout(View):
    def __init__(self):
        super().__init__(timeout=None)

    @discord.ui.button(label="Verify", style=discord.ButtonStyle.success, emoji="🛡️", custom_id="orbit:verify_start")
    async def verify_button(self, interaction: discord.Interaction, button: Button):
        await handle_verify_interaction(interaction)
