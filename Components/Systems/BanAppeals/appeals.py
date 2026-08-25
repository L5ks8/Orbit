import discord
from discord.ext import commands
from Components.Commands.Cases._storage import get_user_cases, update_case_reason
from Components.Systems.BanAppeals._storage import get_appeal_status, close_appeal, register_appeal_submission
import time
from Components.Commands._utils import make_embed

async def resolve_appeal_logic(bot, guild_id: int, target_user_id: int, moderator_id: int, is_accept: bool, moderator_name: str = "a Moderator"):
    guild = bot.get_guild(guild_id)
    if not guild:
        return False, "Server not found."
        
    from Components.Systems.BanAppeals._storage import load_appeals_config
    cfg = load_appeals_config(guild_id)
    
    if is_accept:
        try:
            member = guild.get_member(target_user_id)
            if member:
                if member.is_timed_out():
                    await member.timeout(None, reason=f"Appeal accepted by {moderator_name}")
            else:
                user = await bot.fetch_user(target_user_id)
                await guild.unban(user, reason=f"Appeal accepted by {moderator_name}")
                
                if cfg.get("invite_unbanned", True):
                    invite_channel = guild.system_channel
                    if not invite_channel and guild.text_channels:
                        invite_channel = guild.text_channels[0]
                    if invite_channel:
                        invite = await invite_channel.create_invite(max_uses=1, max_age=86400, reason="Appeal accepted")
                        try:
                            await user.send(f"Your appeal in **{guild.name}** was accepted! You can rejoin using this invite: {invite.url}")
                        except:
                            pass
        except Exception as e:
            return False, f"Could not revoke punishment: {e}"
            
    close_appeal(guild_id, target_user_id)
    return True, "Appeal accepted." if is_accept else "Appeal denied."


class AppealView(discord.ui.View):
    def __init__(self, bot: commands.Bot, guild_id: int, user_id: int):
        super().__init__(timeout=None)
        self.bot = bot
        self.guild_id = guild_id
        self.user_id = user_id

        btn_accept = discord.ui.Button(
            label="Accept", 
            style=discord.ButtonStyle.success, 
            custom_id=f"appeal_acc_{guild_id}_{user_id}"
        )
        btn_accept.callback = self.btn_accept
        self.add_item(btn_accept)

        btn_deny = discord.ui.Button(
            label="Deny", 
            style=discord.ButtonStyle.danger, 
            custom_id=f"appeal_den_{guild_id}_{user_id}"
        )
        btn_deny.callback = self.btn_deny
        self.add_item(btn_deny)

    async def get_appeals_cfg(self):
        from Components.Systems.BanAppeals._storage import load_appeals_config
        from Components.Commands._utils import make_embed
        return load_appeals_config(self.guild_id)

    async def handle_decision(self, interaction: discord.Interaction, is_accept: bool):
        await interaction.response.defer(ephemeral=True)
        guild = self.bot.get_guild(self.guild_id)
        if not guild:
            return await interaction.followup.send(embed=make_embed("Server not found.", discord.Color.red()), ephemeral=True)
            
        if not interaction.user.guild_permissions.moderate_members:
            return await interaction.followup.send(embed=make_embed("You lack permissions to decide on appeals."), ephemeral=True)
            
        cfg = await self.get_appeals_cfg()
        mod_name = "a Moderator" if cfg.get("anonymous_mods", False) else interaction.user.name
        
        success, msg = await resolve_appeal_logic(
            self.bot, 
            self.guild_id, 
            self.user_id, 
            interaction.user.id, 
            is_accept, 
            mod_name
        )
        
        if not success:
            return await interaction.followup.send(embed=make_embed(msg, discord.Color.red()), ephemeral=True)
            
        for child in self.children:
            child.disabled = True
            
        embed = interaction.message.embeds[0]
        display_mod = "a Moderator" if cfg.get("anonymous_mods", False) else interaction.user.mention
        
        if is_accept:
            embed.color = discord.Color.green()
            embed.add_field(name="Status", value=f" Accepted by {display_mod}")
        else:
            embed.color = discord.Color.red()
            embed.add_field(name="Status", value=f" Denied by {display_mod}")
            
        await interaction.message.edit(embed=embed, view=self)
        await interaction.followup.send(embed=make_embed(msg, discord.Color.green() if is_accept else discord.Color.red()), ephemeral=True)

    async def btn_accept(self, interaction: discord.Interaction):
        await self.handle_decision(interaction, True)

    async def btn_deny(self, interaction: discord.Interaction):
        await self.handle_decision(interaction, False)

async def process_new_appeal(bot: commands.Bot, guild_id: int, user_id: int, reason: str, appeals_cfg: dict):
    guild = bot.get_guild(guild_id)
    if not guild:
        return False, "Guild not found."
        
    channel_id_str = appeals_cfg.get("channel_id")
    if not channel_id_str:
        return False, "Appeal channel not configured."
        
    try:
        ch_id = int(channel_id_str)
    except (ValueError, TypeError):
        return False, "Invalid appeal channel configured."

    channel = guild.get_channel(ch_id)
    if not channel:
        try:
            channel = await guild.fetch_channel(ch_id)
        except Exception:
            return False, "Appeal channel not found."
        
    user = await bot.fetch_user(user_id)
    if not user:
        return False, "User not found."
        
    status = get_appeal_status(guild_id, user_id)
    if status:
        if status.get("is_open"):
            return False, "You already have a pending appeal. Please wait for a decision."
            
        if not appeals_cfg.get("multiple_submissions", False):
            return False, "You have already submitted an appeal previously."
            
        cooldown_days = appeals_cfg.get("cooldown_days", 3)
        last_submitted = status.get("last_submitted", 0)
        time_passed = time.time() - last_submitted
        if time_passed < cooldown_days * 86400:
            remaining = (cooldown_days * 86400) - time_passed
            return False, f"You must wait {int(remaining/86400)} more days before appealing again."
        
    cases = get_user_cases(guild_id, user_id)
    allowed = appeals_cfg.get("allowed_punishments", [])
    
    relevant_cases = [c for c in cases if c.get("action", "").lower() in allowed]
    if not relevant_cases:
        return False, "You do not have any active punishments that can be appealed."
        
    latest_case = relevant_cases[0]
    
    embed = discord.Embed(
        title=f"New Appeal | Case #{latest_case.get('case_id')}",
        description=reason[:4096],
        color=discord.Color.gold(),
        timestamp=discord.utils.utcnow()
    )
    embed.set_author(name=str(user), icon_url=user.avatar.url if user.avatar else user.default_avatar.url)
    embed.add_field(name="User ID", value=str(user_id), inline=True)
    embed.add_field(name="Punishment", value=latest_case.get("action", "").capitalize(), inline=True)
    embed.add_field(name="Original Reason", value=latest_case.get("reason", "No reason provided"), inline=False)
    
    view = AppealView(bot, guild_id, user_id)
    
    content = None
    if appeals_cfg.get("mention_mods", True):
        mod_roles = appeals_cfg.get("mod_roles", [])
        mentions = " ".join([f"<@&{r}>" for r in mod_roles])
        if mentions:
            content = mentions
    
    await channel.send(content=content, embed=embed, view=view)
    register_appeal_submission(
        guild_id=guild_id, 
        user_id=user_id,
        user_name=str(user),
        user_avatar=user.avatar.url if user.avatar else user.default_avatar.url,
        action=latest_case.get("action", "").capitalize(),
        reason=reason[:4096]
    )
    return True, "Appeal submitted successfully."

class AppealsCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_interaction(self, interaction: discord.Interaction):
        if not interaction.custom_id:
            return
            
        if interaction.custom_id.startswith("appeal_acc_") or interaction.custom_id.startswith("appeal_den_"):
            parts = interaction.custom_id.split("_")
            if len(parts) >= 4:
                guild_id = int(parts[2])
                user_id = int(parts[3])
                
                view = AppealView(self.bot, guild_id, user_id)
                if interaction.custom_id.startswith("appeal_acc_"):
                    await view.btn_accept(interaction)
                else:
                    await view.btn_deny(interaction)

async def setup(bot: commands.Bot):
    await bot.add_cog(AppealsCog(bot))
