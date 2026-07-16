import time
import io
import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button, Modal, TextInput
from Database.storagehandler import load_verify_config, remove_pending_kick
from Commands.Verify._captcha import generate_captcha

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
        self.role_id = role_id
        self.remove_role_id = remove_role_id

    async def on_submit(self, interaction: discord.Interaction):
        if isinstance(interaction.user, discord.Member) and any(r.id == self.role_id for r in getattr(interaction.user, 'roles', [])):
            return await interaction.response.send_message("You are already verified on this server!", ephemeral=True)

        session = CAPTCHA_SESSIONS.get(interaction.user.id)
        if not session or time.time() - session.get("timestamp", 0) > 600:
            return await interaction.response.send_message("Your CAPTCHA session expired (`> 10 minutes`). Please click 'Request New CAPTCHA'.", ephemeral=True)

        user_typed = self.code_input.value.strip().upper()
        expected = session["code"]

        if user_typed != expected:
            return await interaction.response.send_message(f"**Incorrect CAPTCHA Code!** You entered `{user_typed}`. Please click **Request New CAPTCHA** to try again.", ephemeral=True)

        role = interaction.guild.get_role(self.role_id)
        if not role:
            return await interaction.response.send_message("Configuration error: The verification role could not be found.", ephemeral=True)

        remove_role = interaction.guild.get_role(self.remove_role_id) if self.remove_role_id else None

        try:
            await interaction.user.add_roles(role, reason="Completed automated CAPTCHA verification")
            if remove_role and remove_role in interaction.user.roles:
                try:
                    await interaction.user.remove_roles(remove_role, reason="Removed after CAPTCHA verification")
                except Exception:
                    pass

            remove_pending_kick(interaction.guild.id, interaction.user.id)
            if interaction.user.id in CAPTCHA_SESSIONS:
                del CAPTCHA_SESSIONS[interaction.user.id]

            msg = f"**Verification Successful!** You now have the {role.mention} role and full server access."
            if remove_role:
                msg += f" (`Removed: {remove_role.name}`)"
            await interaction.response.send_message(msg, ephemeral=True)
        except discord.Forbidden:
            await interaction.response.send_message(f"I do not have permission to modify roles ({role.mention}). Please contact a server administrator.", ephemeral=True)
        except Exception as e:
            await interaction.response.send_message(f"An error occurred assigning the verified role: {e}", ephemeral=True)

class CaptchaInteractionLayout(discord.ui.View):
    def __init__(self, role_id: int, remove_role_id: int = None):
        super().__init__(timeout=600)
        self.role_id = role_id
        self.remove_role_id = remove_role_id
        
        btn_enter = Button(label="Enter CAPTCHA Code", style=discord.ButtonStyle.primary)
        btn_refresh = Button(label="Request New CAPTCHA", style=discord.ButtonStyle.secondary)

        async def enter_cb(interaction: discord.Interaction):
            if isinstance(interaction.user, discord.Member) and any(r.id == self.role_id for r in getattr(interaction.user, 'roles', [])):
                return await interaction.response.send_message("You are already verified on this server!", ephemeral=True)
            modal = CaptchaInputModal(self.role_id, self.remove_role_id)
            await interaction.response.send_modal(modal)

        async def refresh_cb(interaction: discord.Interaction):
            if isinstance(interaction.user, discord.Member) and any(r.id == self.role_id for r in getattr(interaction.user, 'roles', [])):
                return await interaction.response.send_message("You are already verified on this server!", ephemeral=True)
            code, img_bytes = generate_captcha()
            CAPTCHA_SESSIONS[interaction.user.id] = {"code": code, "timestamp": time.time()}
            
            filename = "captcha.bmp" if img_bytes[:2] == b"BM" else "captcha.png"
            file = discord.File(fp=io.BytesIO(img_bytes), filename=filename)
            
            embed = discord.Embed(
                title="Security Verification: Solve the CAPTCHA",
                description="Please look at the connected characters in the image below and click **Enter CAPTCHA Code** to type what you see.",
                color=discord.Color.blurple()
            )
            embed.set_image(url=f"attachment://{filename}")
            
            new_view = CaptchaInteractionLayout(self.role_id, self.remove_role_id)
            await interaction.response.edit_message(embed=embed, attachments=[file], view=new_view)

        btn_enter.callback = enter_cb
        btn_refresh.callback = refresh_cb

        self.add_item(btn_enter)
        self.add_item(btn_refresh)

class PersistentVerifyLayout(LayoutView):
    def __init__(self):
        super().__init__(timeout=None)
        self.build_ui()

    def build_ui(self):
        self.clear_items()
        header_str = "### Server Security Verification\nTo protect against automated bots and spam, this server requires CAPTCHA verification before accessing channels."
        info_str = "> Click **Verify Now** below to receive an automated security image with connected characters."
        
        btn_verify = Button(label="Verify Now", style=discord.ButtonStyle.success, custom_id="orbit:verify_start")
        
        async def verify_cb(interaction: discord.Interaction):
            config = await load_verify_config(interaction.guild.id)
            if not config.get("enabled", True):
                return await interaction.response.send_message("Server verification is currently disabled (`Status: Inactive`).", ephemeral=True)

            role_id = config.get("role_id")
            remove_role_id = config.get("remove_role_id")

            if not role_id or not interaction.guild.get_role(role_id):
                return await interaction.response.send_message("Server verification is currently misconfigured (`Verified role not found`).", ephemeral=True)

            if isinstance(interaction.user, discord.Member) and any(r.id == role_id for r in getattr(interaction.user, 'roles', [])):
                return await interaction.response.send_message("You are already verified on this server!", ephemeral=True)

            code, img_bytes = generate_captcha()
            CAPTCHA_SESSIONS[interaction.user.id] = {"code": code, "timestamp": time.time()}

            filename = "captcha.bmp" if img_bytes[:2] == b"BM" else "captcha.png"
            file = discord.File(fp=io.BytesIO(img_bytes), filename=filename)
            
            embed = discord.Embed(
                title="Security Verification: Solve the CAPTCHA",
                description="Please look at the connected characters in the image below and click **Enter CAPTCHA Code** to type what you see.",
                color=discord.Color.blurple()
            )
            embed.set_image(url=f"attachment://{filename}")

            view = CaptchaInteractionLayout(role_id, remove_role_id)
            await interaction.response.send_message(embed=embed, file=file, view=view, ephemeral=True)

        btn_verify.callback = verify_cb
        self.add_item(Container(TextDisplay(content=header_str), Separator(spacing=discord.SeparatorSpacing.small), TextDisplay(content=info_str), Separator(spacing=discord.SeparatorSpacing.small), ActionRow(btn_verify)))
