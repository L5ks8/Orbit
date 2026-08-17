import time
import io
import discord
from discord.ui import Container, TextDisplay, Separator, ActionRow, Button, Modal, TextInput
from Commands.Verify._storage import load_verify_config, remove_pending_kick
from Commands.Verify._captcha import generate_captcha
from Commands._utils import make_embed

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
            return await interaction.response.send_message(embed=make_embed("You are already verified on this server!", discord.Color.red()), ephemeral=True)

        session = CAPTCHA_SESSIONS.get(interaction.user.id)
        if not session or time.time() - session.get("timestamp", 0) > 600:
            return await interaction.response.send_message(embed=make_embed("Your CAPTCHA session expired (`> 10 minutes`). Please click 'Request New CAPTCHA'.", discord.Color.red()), ephemeral=True)

        user_typed = self.code_input.value.strip().upper()
        expected = session["code"]

        if user_typed != expected:
            return await interaction.response.send_message(embed=make_embed(f"**Incorrect CAPTCHA Code!** You entered `{user_typed}`. Please click **Request New CAPTCHA** to try again."), ephemeral=True)

        role = interaction.guild.get_role(self.role_id)
        if not role:
            return await interaction.response.send_message(embed=make_embed("Configuration error: The verification role could not be found.", discord.Color.red()), ephemeral=True)

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

            msg = "You are Successfully Verified now"
            await interaction.response.send_message(embed=make_embed(msg, discord.Color.green()), ephemeral=True)
        except discord.Forbidden:
            await interaction.response.send_message(embed=make_embed(f"I do not have permission to modify roles ({role.mention}). Please contact a server administrator.", discord.Color.red()), ephemeral=True)
        except Exception as e:
            await interaction.response.send_message(embed=make_embed(f"An error occurred assigning the verified role: {e}", discord.Color.red()), ephemeral=True)

class CaptchaInteractionLayout(discord.ui.View):
    def __init__(self, role_id: int, remove_role_id: int = None):
        super().__init__(timeout=600)
        self.role_id = role_id
        self.remove_role_id = remove_role_id
        
        btn_enter = Button(label="Enter CAPTCHA Code", style=discord.ButtonStyle.primary)
        btn_refresh = Button(label="Request New CAPTCHA", style=discord.ButtonStyle.secondary)

        async def enter_cb(interaction: discord.Interaction):
            if isinstance(interaction.user, discord.Member) and any(r.id == self.role_id for r in getattr(interaction.user, 'roles', [])):
                return await interaction.response.send_message(embed=make_embed("You are already verified on this server!", discord.Color.red()), ephemeral=True)
            modal = CaptchaInputModal(self.role_id, self.remove_role_id)
            await interaction.response.send_modal(modal)

        async def refresh_cb(interaction: discord.Interaction):
            if isinstance(interaction.user, discord.Member) and any(r.id == self.role_id for r in getattr(interaction.user, 'roles', [])):
                return await interaction.response.send_message(embed=make_embed("You are already verified on this server!", discord.Color.red()), ephemeral=True)
            code, img_bytes = generate_captcha()
            CAPTCHA_SESSIONS[interaction.user.id] = {"code": code, "timestamp": time.time()}
            
            filename = "captcha.bmp" if img_bytes[:2] == b"BM" else "captcha.png"
            file = discord.File(fp=io.BytesIO(img_bytes), filename=filename)
            
            new_view = CaptchaInteractionLayout(self.role_id, self.remove_role_id)
            embed = discord.Embed(
                title="Security Verification: Solve the CAPTCHA",
                description="Please look at the connected characters in the image below and click **Enter CAPTCHA Code** to type what you see.",
                color=discord.Color.blurple()
            )
            embed.set_image(url=f"attachment://{filename}")
            
            await interaction.response.edit_message(embed=embed, attachments=[file], view=new_view)

        btn_enter.callback = enter_cb
        btn_refresh.callback = refresh_cb

        self.add_item(btn_enter)
        self.add_item(btn_refresh)

class PersistentVerifyLayout(discord.ui.View):
    def __init__(self):
        super().__init__(timeout=None)
        btn_verify = Button(label="Verify Now", style=discord.ButtonStyle.success, custom_id="orbit:verify_start")
        btn_verify.callback = self.verify_cb
        self.add_item(btn_verify)

    async def verify_cb(self, interaction: discord.Interaction):
        config = load_verify_config(interaction.guild.id)
        if not config.get("enabled", True):
            return await interaction.response.send_message(embed=make_embed("Server verification is currently disabled (`Status: Inactive`).", discord.Color.red()), ephemeral=True)

        role_id = config.get("role_id")
        remove_role_id = config.get("remove_role_id")

        if not role_id or not interaction.guild.get_role(role_id):
            return await interaction.response.send_message(embed=make_embed("Server verification is currently misconfigured (`Verified role not found`).", discord.Color.red()), ephemeral=True)

        if isinstance(interaction.user, discord.Member) and any(r.id == role_id for r in getattr(interaction.user, 'roles', [])):
            return await interaction.response.send_message(embed=make_embed("You are already verified on this server!", discord.Color.red()), ephemeral=True)

        verification_type = config.get("verification_type", "captcha")

        if verification_type == "oneclick":
            role = interaction.guild.get_role(role_id)
            remove_role = interaction.guild.get_role(remove_role_id) if remove_role_id else None
            try:
                await interaction.user.add_roles(role, reason="Completed automated One-Click verification")
                if remove_role and remove_role in interaction.user.roles:
                    try:
                        await interaction.user.remove_roles(remove_role, reason="Removed after One-Click verification")
                    except Exception:
                        pass
                remove_pending_kick(interaction.guild.id, interaction.user.id)
                msg = "You are Successfully Verified now"
                await interaction.response.send_message(embed=make_embed(msg, discord.Color.green()), ephemeral=True)
            except discord.Forbidden:
                await interaction.response.send_message(embed=make_embed(f"I do not have permission to modify roles ({role.mention}). Please contact a server administrator.", discord.Color.red()), ephemeral=True)
            except Exception as e:
                await interaction.response.send_message(embed=make_embed(f"An error occurred assigning the verified role: {e}", discord.Color.red()), ephemeral=True)
            return

        elif verification_type == "web_captcha":
            try:
                import secrets
                token = secrets.token_urlsafe(16)
                from Commands.Verify._storage import WEB_VERIFY_SESSIONS
                WEB_VERIFY_SESSIONS[token] = {
                    "user_id": interaction.user.id,
                    "guild_id": interaction.guild.id,
                    "role_id": role_id,
                    "remove_role_id": remove_role_id,
                    "timestamp": time.time()
                }
                
                view = discord.ui.View()
                view.add_item(discord.ui.Button(label="Open Verification Page", style=discord.ButtonStyle.link, url=f"https://orbit-498b.onrender.com/verify/{token}"))
                
                embed = discord.Embed(
                    title="Web Security Verification",
                    description="Please click the button below to solve the CAPTCHA in your browser.\n*This link is unique to you and will expire in 10 minutes.*",
                    color=discord.Color.blurple()
                )
                embed.set_footer(text="By clicking, you accept our privacy policy · Support")
                
                await interaction.response.send_message(embed=embed, view=view, ephemeral=True)
            except Exception as e:
                await interaction.response.send_message(embed=make_embed(f"Failed to generate verification panel: {e}", discord.Color.red()), ephemeral=True)
                
        else: # captcha
            try:
                code, img_bytes = generate_captcha()
                CAPTCHA_SESSIONS[interaction.user.id] = {"code": code, "timestamp": time.time()}
    
                filename = "captcha.bmp" if img_bytes[:2] == b"BM" else "captcha.png"
                file = discord.File(fp=io.BytesIO(img_bytes), filename=filename)
                
                view = CaptchaInteractionLayout(role_id, remove_role_id)
                embed = discord.Embed(
                    title="Security Verification: Solve the CAPTCHA",
                    description="Please look at the connected characters in the image below and click **Enter CAPTCHA Code** to type what you see.",
                    color=discord.Color.blurple()
                )
                embed.set_image(url=f"attachment://{filename}")
                
                await interaction.response.send_message(embed=embed, file=file, view=view, ephemeral=True)
            except Exception as e:
                await interaction.response.send_message(embed=make_embed(f"Failed to generate verification panel: {e}", discord.Color.red()), ephemeral=True)
