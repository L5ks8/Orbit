import discord
from discord.ext import commands
from discord.ui import Modal, TextInput

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
            
            from Embeds import get_command_embed
            kwargs = get_command_embed(interaction.guild.id if interaction.guild else 0, "dm", msg_type="success", target=self.target, exact_content=exact_content)
            await interaction.response.edit_message(**kwargs)
        except discord.Forbidden:
            await interaction.response.send_message("Could not send DM to this user. They may have DMs disabled or blocked the bot.", ephemeral=True)
        except Exception as e:
            await interaction.response.send_message(f"Error sending DM: {e}", ephemeral=True)

class DmComposerLayout(discord.ui.View):
    def __init__(self, target: discord.User | discord.Member, author_id: int):
        super().__init__(timeout=180.0)
        self.target = target
        self.author_id = author_id

    def get_kwargs(self):
        btn_write = discord.ui.Button(label="Write DM", style=discord.ButtonStyle.primary, custom_id="dm_write")

        async def write_callback(interaction: discord.Interaction):
            if interaction.user.id != self.author_id:
                return await interaction.response.send_message("You cannot control this composer.", ephemeral=True)
            await interaction.response.send_modal(DmComposeModal(self.target, self))

        btn_write.callback = write_callback

        from Embeds import get_command_embed
        return get_command_embed(
            self.target.guild.id if hasattr(self.target, "guild") else 0,
            "dm", msg_type="composer", target=self.target, components=[btn_write]
        )

class DmCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="dm", description="Opens an ephemeral composer to DM a user with exact formatting.")
    @commands.has_permissions(administrator=True)
    async def dm(self, ctx: commands.Context, user: discord.User | discord.Member):
        if user.bot:
            return await ctx.send("You cannot send DMs to bot accounts.", ephemeral=True)

        view = DmComposerLayout(user, ctx.author.id)
        await ctx.send(**view.get_kwargs(), ephemeral=True, allowed_mentions=discord.AllowedMentions.none())

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

