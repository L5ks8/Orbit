import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button, Modal, TextInput
from Commands.Blacklist._storage import load_blacklist, add_to_blacklist, remove_from_blacklist, is_blacklisted
from Commands.Blacklist._group import blacklist_group
from Commands.Whitelist._storage import is_whitelisted

class AddUserModal(Modal, title="Add User to Blacklist"):
    user_id_input = TextInput(
        label="User ID",
        placeholder="Enter numeric ID",
        required=True,
        max_length=20
    )
    reason_input = TextInput(
        label="Reason",
        placeholder="Reason for blacklisting",
        required=False,
        max_length=150
    )

    def __init__(self, view: "BlacklistDashboardLayout"):
        super().__init__()
        self.dashboard_view = view

    async def on_submit(self, interaction: discord.Interaction):
        try:
            uid = int(self.user_id_input.value.strip())
        except ValueError:
            return await interaction.response.send_message("Invalid numeric User ID provided.", ephemeral=True)

        if is_whitelisted(interaction.guild.id, uid):
            return await interaction.response.send_message("This user is on the global moderation whitelist (`Immune to Blacklist`).", ephemeral=True)

        reason_str = self.reason_input.value or "No reason provided"
        success = add_to_blacklist(
            guild_id=interaction.guild.id,
            user_id=uid,
            reason=reason_str,
            added_by=interaction.user.id
        )

        if not success:
            return await interaction.response.send_message("User is already blacklisted on this server.", ephemeral=True)

        member = interaction.guild.get_member(uid)
        ban_msg = ""
        if member and not member.bot:
            try:
                await member.ban(reason=f"Blacklisted by {interaction.user} | Reason: {reason_str}")
                ban_msg = "\n*(User was present on the server and has been automatically banned)*"
            except Exception as e:
                ban_msg = f"\n*(Failed to ban user from server: {e})*"

        self.dashboard_view.refresh_content(interaction.guild.id)
        await interaction.response.edit_message(view=self.dashboard_view)
        await interaction.followup.send(f"Added <@{uid}> (`{uid}`) to the blacklist.{ban_msg}", ephemeral=True)


class RemoveUserModal(Modal, title="Remove User from Blacklist"):
    user_id_input = TextInput(
        label="User ID",
        placeholder="Enter numeric ID",
        required=True,
        max_length=20
    )

    def __init__(self, view: "BlacklistDashboardLayout"):
        super().__init__()
        self.dashboard_view = view

    async def on_submit(self, interaction: discord.Interaction):
        try:
            uid = int(self.user_id_input.value.strip())
        except ValueError:
            return await interaction.response.send_message("Invalid numeric User ID provided.", ephemeral=True)

        success = remove_from_blacklist(interaction.guild.id, uid)
        if not success:
            return await interaction.response.send_message("User is not on the blacklist.", ephemeral=True)

        self.dashboard_view.refresh_content(interaction.guild.id)
        await interaction.response.edit_message(view=self.dashboard_view)
        await interaction.followup.send(f"Removed <@{uid}> (`{uid}`) from the blacklist.", ephemeral=True)


class BlacklistDashboardLayout(LayoutView):
    def __init__(self, guild_id: int, author_id: int):
        super().__init__(timeout=180.0)
        self.guild_id = guild_id
        self.author_id = author_id

        btn_add = Button(label="Add user", style=discord.ButtonStyle.success, custom_id="bl_add")
        btn_remove = Button(label="Remove user", style=discord.ButtonStyle.danger, custom_id="bl_remove")
        btn_close = Button(label="Close", style=discord.ButtonStyle.secondary, custom_id="bl_close")

        async def add_callback(interaction: discord.Interaction):
            if interaction.user.id != self.author_id:
                return await interaction.response.send_message("You cannot control this panel.", ephemeral=True)
            await interaction.response.send_modal(AddUserModal(self))

        async def remove_callback(interaction: discord.Interaction):
            if interaction.user.id != self.author_id:
                return await interaction.response.send_message("You cannot control this panel.", ephemeral=True)
            await interaction.response.send_modal(RemoveUserModal(self))

        async def close_callback(interaction: discord.Interaction):
            if interaction.user.id != self.author_id:
                return await interaction.response.send_message("You cannot control this panel.", ephemeral=True)
            
            self.clear_items()
            self.add_item(Container(TextDisplay(content="### Blacklist panel closed\nSession ended by moderator.")))
            await interaction.response.edit_message(view=self)
            self.stop()

        btn_add.callback = add_callback
        btn_remove.callback = remove_callback
        btn_close.callback = close_callback

        self.action_row = ActionRow(btn_add, btn_remove, btn_close)
        self.refresh_content(guild_id)

    def refresh_content(self, guild_id: int):
        self.clear_items()
        data = load_blacklist(guild_id)
        count = len(data)
        
        self.container = Container(
            TextDisplay(content="### Server Blacklist Manager"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Total Blacklisted Users:** `{count}`"),
            Separator(spacing=discord.SeparatorSpacing.small),
            self.action_row
        )
        self.add_item(self.container)


class BlacklistCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.bot.add_check(self.global_blacklist_check)

    async def global_blacklist_check(self, ctx: commands.Context) -> bool:
        if not ctx.guild:
            return True
        if is_blacklisted(ctx.guild.id, ctx.author.id):
            try:
                await ctx.send("You are blacklisted from using commands on this server.", ephemeral=True)
            except Exception:
                pass
            return False
        return True

    @commands.Cog.listener()
    async def on_member_join(self, member: discord.Member):
        if not member.guild or member.bot:
            return
        if is_whitelisted(member.guild.id, member.id):
            return
        if is_blacklisted(member.guild.id, member.id):
            try:
                await member.ban(reason="Automatic ban: User is blacklisted on this server")
                print(f"Auto-banned blacklisted member {member} ({member.id}) joining {member.guild.name}")
            except Exception as e:
                print(f"Failed to auto-ban blacklisted member {member.id}: {e}")

async def _do_blacklist_panel(ctx: commands.Context):
    if not ctx.guild:
        return await ctx.send("This command can only be used inside a server.", ephemeral=True)
    view = BlacklistDashboardLayout(ctx.guild.id, ctx.author.id)
    await ctx.send(view=view)

@blacklist_group.command(name="panel", description="Opens the interactive Blacklist Manager dashboard.")
@commands.has_permissions(administrator=True)
async def blacklist_panel_cmd(ctx: commands.Context):
    await _do_blacklist_panel(ctx)

class BlacklistPanelFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="bl_panel", hidden=True)
    @commands.has_permissions(administrator=True)
    async def bl_panel_prefix(self, ctx: commands.Context):
        await _do_blacklist_panel(ctx)

async def setup(bot: commands.Bot):
    if "blacklist" not in bot.all_commands:
        bot.add_command(blacklist_group)
    await bot.add_cog(BlacklistCommand(bot))
    await bot.add_cog(BlacklistPanelFallback(bot))
