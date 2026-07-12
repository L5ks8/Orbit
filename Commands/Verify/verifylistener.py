import time
import discord
from discord.ext import commands, tasks
from Commands.Verify._storage import load_verify_config, add_pending_kick, remove_pending_kick

class VerifyListenerCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.auto_kick_checker.start()

    def cog_unload(self):
        self.auto_kick_checker.cancel()

    @commands.Cog.listener()
    async def on_member_join(self, member: discord.Member):
        if member.bot:
            return

        config = load_verify_config(member.guild.id)
        if not config.get("enabled", True):
            return

        role_id = config.get("role_id")
        auto_kick = config.get("auto_kick_minutes", 0)

        if role_id and auto_kick > 0:
            kick_time = time.time() + (auto_kick * 60)
            add_pending_kick(member.guild.id, member.id, kick_time)

    @tasks.loop(seconds=30)
    async def auto_kick_checker(self):
        for guild in self.bot.guilds:
            config = load_verify_config(guild.id)
            if not config.get("enabled", True):
                continue

            pending = config.get("pending_kicks", {})
            if not pending:
                continue

            role_id = config.get("role_id")
            if not role_id:
                continue

            to_remove = []
            now = time.time()

            for user_id_str, kick_time in pending.items():
                if now >= kick_time:
                    to_remove.append(user_id_str)
                    member = guild.get_member(int(user_id_str))
                    if member:
                        if not any(r.id == role_id for r in member.roles):
                            try:
                                await member.send(f"You were automatically kicked from **{guild.name}** because you did not complete CAPTCHA verification within `{config['auto_kick_minutes']} minutes`.")
                            except Exception:
                                pass
                            try:
                                await member.kick(reason=f"Failed CAPTCHA verification within {config['auto_kick_minutes']} minutes")
                            except Exception:
                                pass

            if to_remove:
                for uid in to_remove:
                    remove_pending_kick(guild.id, int(uid))

    @commands.Cog.listener()
    async def on_interaction(self, interaction: discord.Interaction):
        if interaction.type != discord.InteractionType.component:
            return
        if interaction.response.is_done():
            return
        custom_id = interaction.data.get("custom_id", "")
        if custom_id == "orbit:verify_start":
            from Commands.Verify._views import CaptchaInteractionLayout, CAPTCHA_SESSIONS
            from Commands.Verify._captcha import generate_captcha
            import io

            if not interaction.guild:
                return await interaction.response.send_message("Verification must be done inside a server.", ephemeral=True)

            config = load_verify_config(interaction.guild.id)
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

    @auto_kick_checker.before_loop
    async def before_auto_kick(self):
        await self.bot.wait_until_ready()

async def setup(bot: commands.Bot):
    from Commands.Verify._views import PersistentVerifyLayout
    bot.add_view(PersistentVerifyLayout())
    await bot.add_cog(VerifyListenerCog(bot))
