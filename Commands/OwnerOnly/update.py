import discord
from discord.ext import commands
from Commands._utils import make_embed

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
            return await interaction.response.send_message(embed=make_embed("You are not authorized to post updates.", discord.Color.red()), ephemeral=True)

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
            color=0x2B2D31,
            timestamp=discord.utils.utcnow()
        )
        footer_text = f"Orbit System Updates | {ver_str}" if ver_str else "Orbit System Updates"
        embed.set_footer(
            text=footer_text,
            icon_url=interaction.client.user.display_avatar.url if interaction.client.user else None
        )

        import os
        base_url = os.environ.get("BASE_URL", "https://orbit-498b.onrender.com")
        btn_website = discord.ui.Button(
            label="Website & Dashboard",
            style=discord.ButtonStyle.link,
            url=base_url
        )
        btn_invite = discord.ui.Button(
            label="Add Orbit to Your Server",
            style=discord.ButtonStyle.link,
            url="https://discord.com/oauth2/authorize?client_id=1480221897131299037&permissions=564430072179839&scope=bot+applications.commands"
        )
        view = discord.ui.View()
        view.add_item(btn_website)
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
            await interaction.followup.send(embed=make_embed(f"Failed to send update message: `{e}`", discord.Color.red()), ephemeral=True)

class UpdateLaunchView(discord.ui.View):
    def __init__(self, author_id: int):
        super().__init__(timeout=300)
        self.author_id = author_id

        btn_open = discord.ui.Button(
            label="Open Update Creator Modal",
            style=discord.ButtonStyle.primary,
            custom_id="orbit:owner_update_open"
        )
        
        async def _open_modal(interaction: discord.Interaction):
            if not await interaction.client.is_owner(interaction.user):
                return await interaction.response.send_message(embed=make_embed("You are not authorized to post updates.", discord.Color.red()), ephemeral=True)
            await interaction.response.send_modal(UpdatePostModal())
            
        btn_open.callback = _open_modal
        self.add_item(btn_open)

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
        
        embed = discord.Embed(
            title="Orbit Update Studio",
            description=f"Click the button below to open your private update editor modal (Title & Content).\nWhen submitted, your announcement will be broadcasted directly to <#{UPDATE_CHANNEL_ID}>.",
            color=0x2B2D31
        )
        
        view = UpdateLaunchView(ctx.author.id)
        await ctx.send(embed=embed, view=view, allowed_mentions=discord.AllowedMentions.none())

    @update_prefix_cmd.error
    async def update_error(self, ctx: commands.Context, error):
        if not isinstance(error, commands.NotOwner):
            pass

async def setup(bot: commands.Bot):
    await bot.add_cog(UpdateCommand(bot))