utf-8import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button, Modal, TextInput

class DmComposeModal(Modal, title="Compose Direct Message"):
    message_input = TextInput(
        label="Message Content",
        style=discord.TextStyle.paragraph,
        placeholder="Type your direct message here... Line breaks and formatting are preserved exactly.",
        required=True,
        max_length=2000
    )

    def __init__(self, target: discord.User | discord.Member, parent_view: "DmComposerLayout"):
        super().__init__()
        self.target = target
        self.parent_view = parent_view

    async def on_submit(self, interaction: discord.Interaction):
        exact_content = self.message_input.value

        try:
            await self.target.send(exact_content)
            
            success_container = Container(
                TextDisplay(content=f"### DM Sent Successfully\n**To:** {self.target.mention} (`{self.target.id}`)"),
                Separator(spacing=discord.SeparatorSpacing.small),
                TextDisplay(content=f"**Message sent:**\n{exact_content}")
            )
            self.parent_view.clear_items()
            self.parent_view.add_item(success_container)
            await interaction.response.edit_message(view=self.parent_view)
        except discord.Forbidden:
            await interaction.response.send_message("Could not send DM to this user. They may have DMs disabled or blocked the bot.", ephemeral=True)
        except Exception as e:
            await interaction.response.send_message(f"Error sending DM: {e}", ephemeral=True)

class DmComposerLayout(LayoutView):
    def __init__(self, target: discord.User | discord.Member, author_id: int):
        super().__init__(timeout=180.0)
        self.target = target
        self.author_id = author_id

        btn_write = Button(label="Write DM", style=discord.ButtonStyle.primary, custom_id="dm_write")

        async def write_callback(interaction: discord.Interaction):
            if interaction.user.id != self.author_id:
                return await interaction.response.send_message("You cannot control this composer.", ephemeral=True)
            await interaction.response.send_modal(DmComposeModal(self.target, self))

        btn_write.callback = write_callback
        action_row = ActionRow(btn_write)

        self.container = Container(
            TextDisplay(content=f"### Direct Message Composer\n**Target:** {self.target.mention} (`{self.target.id}`)"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content="Click the button below to open the text box and compose your message."),
            Separator(spacing=discord.SeparatorSpacing.small),
            action_row
        )
        self.add_item(self.container)

class DmCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="dm", description="Opens an ephemeral composer to DM a user with exact formatting.")
    @commands.has_permissions(administrator=True)
    async def dm(self, ctx: commands.Context, user: discord.User | discord.Member):
        if user.bot:
            return await ctx.send("You cannot send DMs to bot accounts.", ephemeral=True)

        view = DmComposerLayout(user, ctx.author.id)
        await ctx.send(view=view, ephemeral=True, allowed_mentions=discord.AllowedMentions.none())

    @dm.error
    async def dm_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need Administrator permissions to use the DM command.", ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send("Usage: -dm <@user/ID>", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(DmCommand(bot))
