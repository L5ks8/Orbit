import time
import io
import os
import discord
from discord.ui import Modal, TextInput, View, Button
from Components.Systems.Verify._storage import load_verify_config, remove_pending_kick
from Components.Systems.Verify._captcha import generate_captcha
from Components.Commands._utils import make_embed, ORBIT_COLOR
from Components.emojis import Emojis

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

    async def on_error(self, interaction: discord.Interaction, error: Exception, item: discord.ui.Item) -> None:
        if isinstance(error, discord.NotFound) and getattr(error, "code", None) in (10062, 10015):
            return
        await super().on_error(interaction, error, item)

    @discord.ui.button(label="Enter CAPTCHA Code", style=discord.ButtonStyle.primary)
    async def enter_code(self, interaction: discord.Interaction, button: Button):
        if not interaction.guild or not isinstance(interaction.user, discord.Member):
            return await interaction.response.send_message(embed=make_embed("Verification must be completed inside a server.", discord.Color.red()), ephemeral=True)

        if self.role_id and any(r.id == self.role_id for r in interaction.user.roles):
            return await interaction.response.send_message(embed=make_embed("You are already verified on this server!", discord.Color.green()), ephemeral=True)

        modal = CaptchaInputModal(self.role_id, self.remove_role_id)
        await interaction.response.send_modal(modal)

    @discord.ui.button(label="Request New CAPTCHA", style=discord.ButtonStyle.secondary)
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
            color=ORBIT_COLOR
        )
        embed.set_image(url=f"attachment://{filename}")

        await interaction.edit_original_response(embed=embed, attachments=[file], view=new_view)


ACTIVE_INTERACTIONS = set()


class QuestionnaireVerifyModal(Modal):
    def __init__(self, role_id: int, remove_role_id: int = None, questions: list = None, title_text: str = "Verification Questionnaire"):
        super().__init__(title=(title_text or "Verification Questionnaire")[:45])
        self.role_id = int(role_id) if role_id else None
        self.remove_role_id = int(remove_role_id) if remove_role_id else None
        self.questions = (questions or [])[:5]
        self.inputs = []
        if not self.questions:
            self.questions = [{"question": "Do you agree to follow the server rules?", "placeholder": "Type yes to confirm", "answer": ""}]
        for idx, q in enumerate(self.questions):
            q_label = str(q.get("question") or f"Question {idx + 1}").strip()[:45]
            q_placeholder = str(q.get("placeholder") or "Your answer...").strip()[:100]
            ti = TextInput(
                label=q_label,
                placeholder=q_placeholder,
                min_length=1,
                max_length=300,
                required=True
            )
            self.inputs.append((ti, str(q.get("answer") or "").strip()))
            self.add_item(ti)

    async def on_submit(self, interaction: discord.Interaction):
        await interaction.response.defer(ephemeral=True)
        if not interaction.guild or not isinstance(interaction.user, discord.Member):
            return await interaction.followup.send(embed=make_embed("Verification must be completed inside a server.", discord.Color.red()), ephemeral=True)

        for ti, expected in self.inputs:
            if expected:
                valid_options = [opt.strip().lower() for opt in expected.split(",") if opt.strip()]
                user_val = ti.value.strip().lower()
                if valid_options and user_val not in valid_options:
                    return await interaction.followup.send(
                        embed=make_embed(f"**Incorrect answer** for `{ti.label}`.\nPlease review the server rules/instructions and try again.", discord.Color.red()),
                        ephemeral=True
                    )

        role = interaction.guild.get_role(self.role_id)
        if not role:
            return await interaction.followup.send(embed=make_embed("Configuration error: The verified role could not be found on this server.", discord.Color.red()), ephemeral=True)

        remove_role = interaction.guild.get_role(self.remove_role_id) if self.remove_role_id else None
        try:
            await interaction.user.add_roles(role, reason="Completed verification questionnaire")
            if remove_role and remove_role in interaction.user.roles:
                try:
                    await interaction.user.remove_roles(remove_role, reason="Removed after verification questionnaire")
                except Exception:
                    pass
            remove_pending_kick(interaction.guild.id, interaction.user.id)
            await interaction.followup.send(embed=make_embed("You are now successfully verified on this server!", discord.Color.green()), ephemeral=True)
        except discord.Forbidden:
            await interaction.followup.send(embed=make_embed(f"I do not have permission to assign {role.mention}. Please ensure my bot role is higher than the verified role.", discord.Color.red()), ephemeral=True)
        except Exception as e:
            await interaction.followup.send(embed=make_embed(f"An error occurred assigning the verified role: {e}", discord.Color.red()), ephemeral=True)


async def _send_safe(interaction: discord.Interaction, **kwargs):
    try:
        if not interaction.response.is_done():
            await interaction.response.send_message(**kwargs)
        else:
            await interaction.followup.send(**kwargs)
    except (discord.NotFound, discord.HTTPException):
        pass


def _resolve_system_config(config: dict, system_id: str = None, channel_id: int = None, message_id: int = None) -> dict:
    systems = config.get("systems")
    if isinstance(systems, list) and systems:
        # 1. Match by explicit system_id
        if system_id:
            matched = next((s for s in systems if isinstance(s, dict) and str(s.get("id", "")).strip().lower() == str(system_id).strip().lower()), None)
            if matched:
                return matched
        # 2. Match by message_id
        if message_id:
            matched = next((s for s in systems if isinstance(s, dict) and str(s.get("message_id", "")).strip() == str(message_id).strip()), None)
            if matched:
                return matched
        # 3. Match by channel_id (prefer enabled)
        if channel_id:
            matched = next((s for s in systems if isinstance(s, dict) and str(s.get("channel_id", "")).strip() == str(channel_id).strip() and s.get("enabled", True)), None)
            if not matched:
                matched = next((s for s in systems if isinstance(s, dict) and str(s.get("channel_id", "")).strip() == str(channel_id).strip()), None)
            if matched:
                return matched
        # 4. Fallback to active system or first system
        active = next((s for s in systems if isinstance(s, dict) and s.get("enabled", True)), None)
        if active:
            return active
        if len(systems) > 0 and isinstance(systems[0], dict):
            return systems[0]
    return config


async def handle_verify_interaction(interaction: discord.Interaction, system_id: str = None):
    """Central, resilient handler for the verify button click."""
    if interaction.id in ACTIVE_INTERACTIONS:
        return
    ACTIVE_INTERACTIONS.add(interaction.id)
    try:
        if not interaction.guild:
            return await _send_safe(interaction, embed=make_embed("Verification must be completed inside a server.", discord.Color.red()), ephemeral=True)

        raw_cfg = load_verify_config(interaction.guild.id)
        msg_id = getattr(interaction.message, "id", None)
        ch = interaction.channel
        ch_id = getattr(ch, "id", None)
        if hasattr(ch, "parent_id") and ch.parent_id:
            ch_id = ch.parent_id
        elif not ch_id and getattr(interaction, "channel_id", None):
            ch_id = interaction.channel_id

        config = _resolve_system_config(raw_cfg, system_id=system_id, channel_id=ch_id, message_id=msg_id)

        if not config.get("enabled", True) and not raw_cfg.get("enabled", True):
            return await _send_safe(interaction, embed=make_embed("Server verification is currently disabled.", discord.Color.red()), ephemeral=True)

        raw_role_id = config.get("role_id") or raw_cfg.get("role_id")
        if not raw_role_id:
            return await _send_safe(interaction, embed=make_embed("Server verification is currently misconfigured (`Verified role not set`). Please contact an administrator.", discord.Color.red()), ephemeral=True)

        try:
            role_id = int(raw_role_id)
        except (ValueError, TypeError):
            return await _send_safe(interaction, embed=make_embed("Server verification has an invalid role configured. Please contact an administrator.", discord.Color.red()), ephemeral=True)

        raw_rem_role_id = config.get("remove_role_id") or raw_cfg.get("remove_role_id")
        remove_role_id = None
        if raw_rem_role_id:
            try:
                remove_role_id = int(raw_rem_role_id)
            except (ValueError, TypeError):
                remove_role_id = None

        verification_type = str(config.get("verification_type") or raw_cfg.get("verification_type") or "captcha").strip().lower()
        if verification_type not in ["oneclick", "captcha", "web_captcha", "questionnaire"]:
            verification_type = "captcha"

        questions = config.get("questions") if isinstance(config.get("questions"), list) else (raw_cfg.get("questions") or [])
        questionnaire_enabled = bool(config.get("questionnaire_enabled") or verification_type == "questionnaire")

        # QUESTIONNAIRE MODAL (must be sent before deferring!)
        if (verification_type == "questionnaire" or (questionnaire_enabled and questions)) and not interaction.response.is_done():
            if isinstance(interaction.user, discord.Member) and any(r.id == role_id for r in interaction.user.roles):
                return await _send_safe(interaction, embed=make_embed("You are already verified on this server!", discord.Color.green()), ephemeral=True)
            modal = QuestionnaireVerifyModal(
                role_id=role_id,
                remove_role_id=remove_role_id,
                questions=questions,
                title_text=str(config.get("name") or config.get("embed_title") or "Verification Questionnaire")
            )
            await interaction.response.send_modal(modal)
            return

        if not interaction.response.is_done():
            try:
                await interaction.response.defer(ephemeral=True)
            except Exception:
                pass

        member = interaction.user if isinstance(interaction.user, discord.Member) else interaction.guild.get_member(interaction.user.id)
        if not member:
            try:
                member = await interaction.guild.fetch_member(interaction.user.id)
            except Exception:
                member = None

        if not isinstance(member, discord.Member):
            return await _send_safe(interaction, embed=make_embed("Could not resolve your server member details. Please try again.", discord.Color.red()), ephemeral=True)

        role = interaction.guild.get_role(role_id)
        if not role:
            return await _send_safe(interaction, embed=make_embed("Server verification is currently misconfigured (`Verified role not found in server`).", discord.Color.red()), ephemeral=True)

        if any(r.id == role_id for r in member.roles):
            return await _send_safe(interaction, embed=make_embed("You are already verified on this server!", discord.Color.green()), ephemeral=True)

        if interaction.guild.me.top_role <= role:
            return await _send_safe(interaction, embed=make_embed(f"I cannot assign {role.mention} because my bot role is lower in the hierarchy. Please ask a server admin to move my role above the verified role in Server Settings -> Roles.", discord.Color.red()), ephemeral=True)

        # ONE-CLICK VERIFICATION
        if verification_type == "oneclick":
            remove_role = interaction.guild.get_role(remove_role_id) if remove_role_id else None
            try:
                await member.add_roles(role, reason="Completed automated One-Click verification")
                if remove_role and remove_role in member.roles:
                    try:
                        await member.remove_roles(remove_role, reason="Removed after One-Click verification")
                    except Exception:
                        pass

                remove_pending_kick(interaction.guild.id, member.id)
                await _send_safe(interaction, embed=make_embed(" You are now successfully verified on this server!", discord.Color.green()), ephemeral=True)
            except discord.Forbidden:
                await _send_safe(interaction, embed=make_embed(f"I do not have permission to modify roles for {role.mention}. Please check my role hierarchy.", discord.Color.red()), ephemeral=True)
            except Exception as e:
                await _send_safe(interaction, embed=make_embed(f"An error occurred assigning the verified role: {e}", discord.Color.red()), ephemeral=True)
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
                view.add_item(Button(label="Open Verification Page", style=discord.ButtonStyle.link, url=verify_url))

                embed = discord.Embed(
                    title="Web Security Verification",
                    description=f"Please click the button below to solve the CAPTCHA in your browser.\n*This link is unique to you and will expire in 10 minutes.*\n\n[Privacy Policy]({base_url}/privacy) · [Support Server](https://discord.gg/wekuhwCsUg)",
                    color=ORBIT_COLOR
                )
                await _send_safe(interaction, embed=embed, view=view, ephemeral=True)
            except Exception as e:
                await _send_safe(interaction, embed=make_embed(f"Failed to generate verification panel: {e}", discord.Color.red()), ephemeral=True)
            return

        else:
            try:
                code, img_bytes = generate_captcha()
                CAPTCHA_SESSIONS[member.id] = {"code": code, "timestamp": time.time()}

                filename = "captcha.bmp" if img_bytes[:2] == b"BM" else "captcha.png"
                file = discord.File(fp=io.BytesIO(img_bytes), filename=filename)

                view = CaptchaInteractionLayout(role_id, remove_role_id)
                embed = discord.Embed(
                    title="Security Verification: Solve the CAPTCHA",
                    description="Please look at the characters in the image below and click **Enter CAPTCHA Code** to type what you see.",
                    color=ORBIT_COLOR
                )
                embed.set_image(url=f"attachment://{filename}")

                await _send_safe(interaction, embed=embed, file=file, view=view, ephemeral=True)
            except Exception as e:
                await _send_safe(interaction, embed=make_embed(f"Failed to generate verification panel: {e}", discord.Color.red()), ephemeral=True)
    finally:
        ACTIVE_INTERACTIONS.discard(interaction.id)


class PersistentVerifyLayout(View):
    def __init__(self):
        super().__init__(timeout=None)

    async def on_error(self, interaction: discord.Interaction, error: Exception, item: discord.ui.Item) -> None:
        if isinstance(error, discord.NotFound) and getattr(error, "code", None) in (10062, 10015):
            return
        await super().on_error(interaction, error, item)

    @discord.ui.button(label="Verify", style=discord.ButtonStyle.success, custom_id="orbit:verify_start")
    async def verify_button(self, interaction: discord.Interaction, button: Button):
        await handle_verify_interaction(interaction)
