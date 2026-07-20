import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button
from Commands.Log._storage import log_event

class UnbanConfirmView(discord.ui.View):
    def __init__(self, ban_entry: discord.BanEntry, reason: str, author: discord.Member, content_kwargs: dict):
        super().__init__(timeout=60.0)
        self.ban_entry = ban_entry
        self.reason = reason
        self.author = author
        self.content_kwargs = content_kwargs

        btn_confirm = Button(label="Confirm unban", style=discord.ButtonStyle.success, custom_id="unban_confirm")
        btn_cancel = Button(label="Cancel", style=discord.ButtonStyle.secondary, custom_id="unban_cancel")

        async def confirm_callback(interaction: discord.Interaction):
            if interaction.user.id != self.author.id:
                return await interaction.response.send_message("You are not authorized to perform this action.", ephemeral=True)
            
            try:
                from Embeds import get_command_embed
                await interaction.guild.unban(self.ban_entry.user, reason=f"Unbanned by {self.author} | Reason: {self.reason}")
                await log_event(
                    interaction.guild,
                    "moderation_action",
                    "User Unbanned (`-unban`)",
                    f"**Target:** {self.ban_entry.user.mention} (`{self.ban_entry.user.id}`)\n**Moderator:** {self.author.mention} (`{self.author.id}`)\n**Reason:** {self.reason}"
                )
                
                kwargs = get_command_embed(interaction.guild_id, "unban", msg_type="success", ban_entry=self.ban_entry, reason=self.reason, author=self.author)
                
                if "embed" in kwargs:
                    await interaction.response.edit_message(embed=kwargs["embed"], view=None)
                elif "components" in kwargs:
                    lv = LayoutView()
                    for comp in kwargs["components"]: lv.add_item(comp)
                    await interaction.response.edit_message(view=lv)
                
                self.stop()
            except discord.Forbidden:
                await interaction.response.send_message("I do not have sufficient permissions to unban this user.", ephemeral=True)
            except Exception as e:
                await interaction.response.send_message(f"Error unbanning user: {e}", ephemeral=True)

        async def cancel_callback(interaction: discord.Interaction):
            if interaction.user.id != self.author.id:
                return await interaction.response.send_message("You are not authorized to perform this action.", ephemeral=True)
            from Embeds import get_command_embed
            kwargs = get_command_embed(interaction.guild_id, "unban", msg_type="cancel")
            if "embed" in kwargs:
                await interaction.response.edit_message(embed=kwargs["embed"], view=None)
            elif "components" in kwargs:
                lv = LayoutView()
                for comp in kwargs["components"]: lv.add_item(comp)
                await interaction.response.edit_message(view=lv)
            self.stop()

        btn_confirm.callback = confirm_callback
        btn_cancel.callback = cancel_callback

        self.add_item(btn_confirm)
        self.add_item(btn_cancel)

    def get_view(self):
        if "components" in self.content_kwargs:
            lv = LayoutView(timeout=60.0)
            for comp in self.content_kwargs["components"]:
                lv.add_item(comp)
            ar = ActionRow()
            for child in self.children:
                ar.add_item(child)
            lv.add_item(ar)
            return lv
        return self

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

        from Embeds import get_command_embed
        kwargs = get_command_embed(ctx.guild.id, "unban", msg_type="prompt", ban_entry=ban_entry, reason=reason)
        view = UnbanConfirmView(ban_entry, reason, ctx.author, kwargs)
        
        if "embed" in kwargs:
            await ctx.send(embed=kwargs["embed"], view=view.get_view(), allowed_mentions=discord.AllowedMentions.none())
        elif "components" in kwargs:
            await ctx.send(view=view.get_view(), allowed_mentions=discord.AllowedMentions.none())

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

