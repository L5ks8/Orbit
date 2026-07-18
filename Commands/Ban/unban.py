utf-8import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button
from Commands.Log._storage import log_event

class UnbanConfirmLayout(LayoutView):
    def __init__(self, ban_entry: discord.BanEntry, reason: str, author: discord.Member):
        super().__init__(timeout=60.0)
        self.ban_entry = ban_entry
        self.reason = reason
        self.author = author

        btn_confirm = Button(label="Confirm unban", style=discord.ButtonStyle.success, custom_id="unban_confirm")
        btn_cancel = Button(label="Cancel", style=discord.ButtonStyle.secondary, custom_id="unban_cancel")

        async def confirm_callback(interaction: discord.Interaction):
            if interaction.user.id != self.author.id:
                return await interaction.response.send_message("You are not authorized to perform this action.", ephemeral=True)
            
            try:
                await interaction.guild.unban(self.ban_entry.user, reason=f"Unbanned by {self.author} | Reason: {self.reason}")
                await log_event(
                    interaction.guild,
        "moderation_action",
                    "User Unbanned (`-unban`)",
                    f"**Target:** {self.ban_entry.user.mention} (`{self.ban_entry.user.id}`)\n**Moderator:** {self.author.mention} (`{self.author.id}`)\n**Reason:** {self.reason}"
                )
                
                success_container = Container(
                    TextDisplay(content=f"### User unbanned\n**Target:** {self.ban_entry.user.mention} (`{self.ban_entry.user.id}`)"),
                    Separator(spacing=discord.SeparatorSpacing.small),
                    TextDisplay(content=f"**Reason:** {self.reason}\n**Moderator:** {self.author.mention}")
                )
                self.clear_items()
                self.add_item(success_container)
                await interaction.response.edit_message(view=self)
                self.stop()
            except discord.Forbidden:
                await interaction.response.send_message("I do not have sufficient permissions to unban this user.", ephemeral=True)
            except Exception as e:
                await interaction.response.send_message(f"Error unbanning user: {e}", ephemeral=True)

        async def cancel_callback(interaction: discord.Interaction):
            if interaction.user.id != self.author.id:
                return await interaction.response.send_message("You are not authorized to perform this action.", ephemeral=True)
            
            cancel_container = Container(
                TextDisplay(content="### Unban cancelled\nThe operation was cancelled.")
            )
            self.clear_items()
            self.add_item(cancel_container)
            await interaction.response.edit_message(view=self)
            self.stop()

        btn_confirm.callback = confirm_callback
        btn_cancel.callback = cancel_callback

        action_row = ActionRow(btn_confirm, btn_cancel)

        self.container = Container(
            TextDisplay(content=f"### Confirm unban\nAre you sure you want to unban **{self.ban_entry.user.name}**?"),
            Separator(spacing=discord.SeparatorSpacing.large),
            TextDisplay(content=f"**Target:** {self.ban_entry.user.mention} (`{self.ban_entry.user.id}`)\n**Original Ban Reason:** {self.ban_entry.reason or 'None'}\n**New Reason:** {self.reason}"),
            Separator(spacing=discord.SeparatorSpacing.small),
            action_row
        )
        self.add_item(self.container)

class UnbanCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="unban", description="Unbans a user from the server using Components V2 UI.")
    @commands.has_permissions(ban_members=True)
    @commands.bot_has_permissions(ban_members=True)
    async def unban(self, ctx: commands.Context, user_id: str, *, reason: str = "No reason provided"):
        try:
            target_id = int(user_id.strip("<@!>"))
        except ValueError:
            return await ctx.send("Please provide a valid numeric user ID.", ephemeral=True)

        try:
            ban_entry = await ctx.guild.fetch_ban(discord.Object(id=target_id))
        except discord.NotFound:
            return await ctx.send("This user is not currently banned on this server.", ephemeral=True)
        except discord.Forbidden:
            return await ctx.send("I do not have permission to view the ban list.", ephemeral=True)

        view = UnbanConfirmLayout(ban_entry, reason, ctx.author)
        await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

    @unban.error
    async def unban_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You do not have permission to unban members.", ephemeral=True)
        elif isinstance(error, commands.BotMissingPermissions):
            await ctx.send("I am missing the Ban Members permission.", ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send("Usage: -unban <ID> [reason]", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(UnbanCommand(bot))
