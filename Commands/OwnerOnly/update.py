import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button

UPDATE_CHANNEL_ID = 1525664972720312390


class UpdatePostModal(discord.ui.Modal, title="Post Orbit Changelog & Update"):
    title_input = discord.ui.TextInput(
        label="Update Title",
        placeholder="e.g. Orbit v2.5 - New Verification & Security Features",
        max_length=256,
        required=True
    )
    version_input = discord.ui.TextInput(
        label="Version Tag (Optional)",
        placeholder="e.g. v2.5.0 Patch Update",
        max_length=100,
        required=False
    )
    content_input = discord.ui.TextInput(
        label="Update Content",
        placeholder="Detail all changes, bug fixes, and improvements here. Supports full Markdown format.",
        style=discord.TextStyle.paragraph,
        max_length=4000,
        required=True
    )
    ping_input = discord.ui.TextInput(
        label="Notification Ping (Optional)",
        placeholder="Write 'yes' for @everyone, 'here' for @here, or leave blank",
        max_length=20,
        required=False
    )

    async def on_submit(self, interaction: discord.Interaction):
        if not await interaction.client.is_owner(interaction.user):
            return await interaction.response.send_message("You are not authorized to post updates.", ephemeral=True)

        await interaction.response.defer(ephemeral=True)

        channel = interaction.client.get_channel(UPDATE_CHANNEL_ID)
        if not channel:
            try:
                channel = await interaction.client.fetch_channel(UPDATE_CHANNEL_ID)
            except Exception:
                channel = None

        if not channel or not isinstance(channel, discord.abc.Messageable):
            return await interaction.followup.send(
                f"Error: Could not access Update Channel (`#{UPDATE_CHANNEL_ID}`). Please verify Orbit is on the server where channel `{UPDATE_CHANNEL_ID}` is located and has permission to send messages there.",
                ephemeral=True
            )

        title_str = self.title_input.value.strip()
        desc_str = self.content_input.value.strip()
        ver_str = self.version_input.value.strip()
        ping_str = self.ping_input.value.strip().lower()

        if ping_str in ["yes", "true", "everyone", "@everyone", "all"]:
            content_msg = "@everyone"
        elif ping_str in ["here", "@here"]:
            content_msg = "@here"
        else:
            content_msg = None

        embed = discord.Embed(
            title=title_str,
            description=desc_str,
            color=0x00D2FF,
            timestamp=discord.utils.utcnow()
        )
        footer_text = f"Orbit System Updates | {ver_str}" if ver_str else "Orbit System Updates"
        embed.set_footer(
            text=footer_text,
            icon_url=interaction.client.user.display_avatar.url if interaction.client.user else None
        )

        btn_server = discord.ui.Button(
            label="Support Server",
            style=discord.ButtonStyle.link,
            url="https://discord.gg/qW6kjq6TG"
        )
        btn_invite = discord.ui.Button(
            label="Add Orbit to Your Server",
            style=discord.ButtonStyle.link,
            url="https://discord.com/oauth2/authorize?client_id=1480221897131299037&permissions=564430072179831&scope=bot+applications.commands"
        )
        view = discord.ui.View()
        view.add_item(btn_server)
        view.add_item(btn_invite)

        try:
            msg = await channel.send(
                content=content_msg,
                embed=embed,
                view=view,
                allowed_mentions=discord.AllowedMentions(everyone=True)
            )
            await interaction.followup.send(
                f"Update successfully published to <#{UPDATE_CHANNEL_ID}>.\nJump link: {msg.jump_url}",
                ephemeral=True
            )
        except Exception as e:
            await interaction.followup.send(f"Failed to send update message: `{e}`", ephemeral=True)


class UpdateLaunchLayout(LayoutView):
    def __init__(self, author_id: int):
        super().__init__(timeout=300)
        self.author_id = author_id

        btn_open = Button(
            label="Open Update Creator Modal",
            style=discord.ButtonStyle.primary,
            custom_id="orbit:owner_update_open"
        )

        async def _open_cb(interaction: discord.Interaction):
            if interaction.user.id != self.author_id:
                return await interaction.response.send_message("You are not authorized to post updates.", ephemeral=True)
            await interaction.response.send_modal(UpdatePostModal())

        btn_open.callback = _open_cb
        self.add_item(
            Container(
                TextDisplay(content="### Orbit Update Studio"),
                Separator(spacing=discord.SeparatorSpacing.small),
                TextDisplay(content=f"Click the button below to open your private update editor modal (Title & Content).\nWhen submitted, your announcement will be broadcasted directly to <#{UPDATE_CHANNEL_ID}>."),
                Separator(spacing=discord.SeparatorSpacing.small),
                ActionRow(btn_open)
            )
        )


class UpdateCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="update", aliases=["changelog", "postupdate"], hidden=True)
    @commands.is_owner()
    async def update_prefix_cmd(self, ctx: commands.Context):
        try:
            await ctx.message.delete()
        except Exception:
            pass
        view = UpdateLaunchLayout(ctx.author.id)
        try:
            await ctx.author.send(view=view, allowed_mentions=discord.AllowedMentions.none())
        except discord.Forbidden:
            await ctx.send(view=view, delete_after=60.0, allowed_mentions=discord.AllowedMentions.none())

    @update_prefix_cmd.error
    async def update_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.NotOwner):
            pass
        else:
            try:
                await ctx.send(f"Update command error: `{error}`", delete_after=10.0)
            except Exception:
                pass

    @commands.Cog.listener()
    async def on_interaction(self, interaction: discord.Interaction):
        if interaction.type != discord.InteractionType.component:
            return
        custom_id = interaction.data.get("custom_id", "")
        if custom_id == "orbit:owner_update_open":
            if interaction.response.is_done():
                return
            if not await interaction.client.is_owner(interaction.user):
                return await interaction.response.send_message("You are not authorized to post updates.", ephemeral=True)
            await interaction.response.send_modal(UpdatePostModal())


async def setup(bot: commands.Bot):
    await bot.add_cog(UpdateCommand(bot))
