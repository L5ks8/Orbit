import discord
from discord.ext import commands
from Commands.Cases._storage import get_user_cases, update_case_reason
import time

class AppealView(discord.ui.View):
    def __init__(self, bot: commands.Bot, guild_id: int, user_id: int):
        super().__init__(timeout=None)
        self.bot = bot
        self.guild_id = guild_id
        self.user_id = user_id

        # Accept Button
        btn_accept = discord.ui.Button(
            label="Annehmen", 
            style=discord.ButtonStyle.success, 
            custom_id=f"appeal_acc_{guild_id}_{user_id}"
        )
        btn_accept.callback = self.btn_accept
        self.add_item(btn_accept)

        # Deny Button
        btn_deny = discord.ui.Button(
            label="Ablehnen", 
            style=discord.ButtonStyle.danger, 
            custom_id=f"appeal_den_{guild_id}_{user_id}"
        )
        btn_deny.callback = self.btn_deny
        self.add_item(btn_deny)

    async def btn_accept(self, interaction: discord.Interaction):
        await interaction.response.defer(ephemeral=True)
        guild = self.bot.get_guild(self.guild_id)
        if not guild:
            return await interaction.followup.send("Server not found.", ephemeral=True)
            
        if not interaction.user.guild_permissions.moderate_members:
            return await interaction.followup.send("You lack permissions to accept appeals.", ephemeral=True)
            
        try:
            member = guild.get_member(self.user_id)
            if member:
                if member.is_timed_out():
                    await member.timeout(None, reason=f"Appeal accepted by {interaction.user}")
            else:
                user = await self.bot.fetch_user(self.user_id)
                await guild.unban(user, reason=f"Appeal accepted by {interaction.user}")
        except Exception as e:
            await interaction.followup.send(f"Could not revoke punishment: {e}", ephemeral=True)
            
        for child in self.children:
            child.disabled = True
        
        embed = interaction.message.embeds[0]
        embed.color = discord.Color.green()
        embed.add_field(name="Status", value=f"✅ Accepted by {interaction.user.mention}")
        
        await interaction.message.edit(embed=embed, view=self)
        await interaction.followup.send("Appeal accepted and user punishment revoked.", ephemeral=True)

    async def btn_deny(self, interaction: discord.Interaction):
        await interaction.response.defer(ephemeral=True)
        if not interaction.user.guild_permissions.moderate_members:
            return await interaction.followup.send("You lack permissions to deny appeals.", ephemeral=True)

        for child in self.children:
            child.disabled = True
            
        embed = interaction.message.embeds[0]
        embed.color = discord.Color.red()
        embed.add_field(name="Status", value=f"❌ Denied by {interaction.user.mention}")
        
        await interaction.message.edit(embed=embed, view=self)
        await interaction.followup.send("Appeal denied.", ephemeral=True)

async def process_new_appeal(bot: commands.Bot, guild_id: int, user_id: int, reason: str, appeals_cfg: dict):
    guild = bot.get_guild(guild_id)
    if not guild:
        return False, "Guild not found."
        
    channel_id_str = appeals_cfg.get("channel_id")
    if not channel_id_str:
        return False, "Appeal channel not configured."
        
    channel = guild.get_channel(int(channel_id_str))
    if not channel:
        return False, "Appeal channel not found."
        
    user = await bot.fetch_user(user_id)
    if not user:
        return False, "User not found."
        
    cases = get_user_cases(guild_id, user_id)
    allowed = appeals_cfg.get("allowed_punishments", [])
    
    relevant_cases = [c for c in cases if c.get("action", "").lower() in allowed]
    if not relevant_cases:
        return False, "You do not have any active punishments that can be appealed."
        
    latest_case = relevant_cases[0]
    
    embed = discord.Embed(
        title=f"New Appeal | Case #{latest_case.get('case_id')}",
        description=reason,
        color=discord.Color.gold(),
        timestamp=discord.utils.utcnow()
    )
    embed.set_author(name=str(user), icon_url=user.avatar.url if user.avatar else user.default_avatar.url)
    embed.add_field(name="User ID", value=str(user_id), inline=True)
    embed.add_field(name="Punishment", value=latest_case.get("action", "").capitalize(), inline=True)
    embed.add_field(name="Original Reason", value=latest_case.get("reason", "No reason provided"), inline=False)
    
    view = AppealView(bot, guild_id, user_id)
    
    mod_roles = appeals_cfg.get("mod_roles", [])
    mentions = " ".join([f"<@&{r}>" for r in mod_roles])
    content = mentions if mentions else None
    
    await channel.send(content=content, embed=embed, view=view)
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
                
                # Reconstruct the view to handle the button
                view = AppealView(self.bot, guild_id, user_id)
                if interaction.custom_id.startswith("appeal_acc_"):
                    await view.btn_accept(interaction)
                else:
                    await view.btn_deny(interaction)

async def setup(bot: commands.Bot):
    await bot.add_cog(AppealsCog(bot))
