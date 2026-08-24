import discord
from discord.ext import commands
from discord.ui import ActionRow, Button
from Components.Dashboard.Automoderation.log_storage import log_event
from Components.Commands.ModLog._modlog_storage import add_modlog
from Components.Commands._utils import make_embed

class UnbanConfirmView(discord.ui.View):
    def __init__(self, ban_entry: discord.BanEntry, reason: str, author: discord.Member):
        super().__init__(timeout=60.0)
        self.ban_entry = ban_entry
        self.reason = reason
        self.author = author

        btn_confirm = Button(label="Confirm unban", style=discord.ButtonStyle.success, custom_id="unban_confirm")
        btn_cancel = Button(label="Cancel", style=discord.ButtonStyle.secondary, custom_id="unban_cancel")

        async def confirm_callback(interaction: discord.Interaction):
            if interaction.user.id != self.author.id:
                return await interaction.response.send_message(embed=make_embed("You are not authorized to perform this action.", discord.Color.red()), ephemeral=True)
            
            try:
                await interaction.guild.unban(self.ban_entry.user, reason=f"Unbanned by {self.author} | Reason: {self.reason}")
                add_modlog(interaction.guild.id, self.ban_entry.user.id, self.author.id, "Unban", self.reason)
                await log_event(
                    interaction.guild,
                    "moderation_action",
                    "User Unbanned (`-unban`)",
                    f"**Target:** {self.ban_entry.user.mention} (`{self.ban_entry.user.id}`)\n**Moderator:** {self.author.mention} (`{self.author.id}`)\n**Reason:** {self.reason}"
                )

                embed = discord.Embed(title="User unbanned", color=discord.Color.green())
                embed.add_field(name="Target", value=f"{self.ban_entry.user.mention} (`{self.ban_entry.user.id}`)", inline=False)
                embed.add_field(name="Reason", value=self.reason, inline=False)
                embed.add_field(name="Moderator", value=self.author.mention, inline=False)
                await interaction.response.edit_message(embed=embed, view=None)
                
                self.stop()
            except discord.Forbidden:
                await interaction.response.send_message(embed=make_embed("I do not have sufficient permissions to unban this user.", discord.Color.red()), ephemeral=True)
            except Exception as e:
                await interaction.response.send_message(embed=make_embed(f"Error unbanning user: {e}", discord.Color.red()), ephemeral=True)

        async def cancel_callback(interaction: discord.Interaction):
            if interaction.user.id != self.author.id:
                return await interaction.response.send_message(embed=make_embed("You are not authorized to perform this action.", discord.Color.red()), ephemeral=True)
            embed = discord.Embed(title="Unban cancelled", description="The operation was cancelled.", color=discord.Color.red())
            await interaction.response.edit_message(embed=embed, view=None)
            self.stop()

        btn_confirm.callback = confirm_callback
        btn_cancel.callback = cancel_callback

        self.add_item(btn_confirm)
        self.add_item(btn_cancel)



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
            return await ctx.send(embed=make_embed("Please provide a valid numeric user ID.", discord.Color.red()), ephemeral=True)

        try:
            ban_entry = await ctx.guild.fetch_ban(discord.Object(id=target_id))
        except discord.NotFound:
            return await ctx.send(embed=make_embed("This user is not currently banned on this server.", discord.Color.red()), ephemeral=True)
        except discord.Forbidden:
            return await ctx.send(embed=make_embed("I do not have permission to view the ban list.", discord.Color.red()), ephemeral=True)

        embed = discord.Embed(title="Confirm unban", description=f"Are you sure you want to unban **{ban_entry.user.name}**?", color=discord.Color.orange())
        embed.add_field(name="Target", value=f"{ban_entry.user.mention} (`{ban_entry.user.id}`)", inline=False)
        embed.add_field(name="Original Ban Reason", value=ban_entry.reason or 'None', inline=False)
        embed.add_field(name="New Reason", value=reason, inline=False)
        view = UnbanConfirmView(ban_entry, reason, ctx.author)
        await ctx.send(embed=embed, view=view, allowed_mentions=discord.AllowedMentions.none())

    @unban.error
    async def unban_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send(embed=make_embed("You do not have permission to unban members.", discord.Color.red()), ephemeral=True)
        elif isinstance(error, commands.BotMissingPermissions):
            await ctx.send(embed=make_embed("I am missing the Ban Members permission.", discord.Color.red()), ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send(embed=make_embed("Usage: -unban <ID> [reason]", discord.Color.red()), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(UnbanCommand(bot))



