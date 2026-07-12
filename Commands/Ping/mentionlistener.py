import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button

class MentionOverviewLayout(LayoutView):
    def __init__(self, bot: commands.Bot, prefix: str):
        super().__init__(timeout=180.0)
        self.bot = bot
        ms = round(bot.latency * 1000)

        header_str = "### Hello! I am Orbit\n**Your advanced utility & moderation assistant for Discord.**"
        info_str = (
            f"> **Prefix on this server:** `{prefix}` *(Slash commands `/` also active)*\n"
            f"> **Current Latency:** `{ms} ms`\n\n"
            f"**Quick Navigation:**\n"
            f"• Use `/help` or `{prefix}help` to view all available commands across all systems.\n"
            f"• Use `/ticket setup` to deploy an interactive support ticket desk.\n"
            f"• Use `/verify setup` to enable automated server member verification.\n"
            f"• Use `/blacklist panel` to manage server command blocklists."
        )

        btn_help = Button(label="Command Overview", style=discord.ButtonStyle.primary, custom_id="mention_btn_help")
        btn_ping = Button(label="Refresh Latency", style=discord.ButtonStyle.secondary, custom_id="mention_btn_ping")

        async def help_cb(interaction: discord.Interaction):
            await interaction.response.send_message(
                f"### Orbit Command Center\nYou can access all commands by typing `/` in the chat bar and selecting **Orbit**, or by running `{prefix}help`.\n\n**Main Systems:**\n`/ticket`, `/verify`, `/role`, `/blacklist`, `/afk`, `/ping`.",
                ephemeral=True
            )

        async def ping_cb(interaction: discord.Interaction):
            current_ms = round(self.bot.latency * 1000)
            await interaction.response.send_message(f"**Current Bot Latency:** `{current_ms} ms`", ephemeral=True)

        btn_help.callback = help_cb
        btn_ping.callback = ping_cb

        self.container = Container(
            TextDisplay(content=header_str),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=info_str),
            Separator(spacing=discord.SeparatorSpacing.small),
            ActionRow(btn_help, btn_ping)
        )
        self.add_item(self.container)


class MentionListener(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_message(self, message: discord.Message):
        if message.author.bot or not message.guild:
            return

        if self.bot.user in message.mentions and not message.mention_everyone:
            ctx = await self.bot.get_context(message)
            if ctx.valid and ctx.command is not None:
                return

            prefix = "-"
            pfx_attr = getattr(self.bot, "command_prefix", "-")
            if isinstance(pfx_attr, str):
                prefix = pfx_attr
            elif isinstance(pfx_attr, (list, tuple)) and len(pfx_attr) > 0:
                prefix = [p for p in pfx_attr if not p.startswith("<@")][0] if any(not p.startswith("<@") for p in pfx_attr) else "-"

            view = MentionOverviewLayout(self.bot, prefix)
            try:
                await message.reply(view=view, mention_author=False)
            except Exception as e:
                print(f"[MENTION ERROR] Could not reply to ping: {e}")

async def setup(bot: commands.Bot):
    await bot.add_cog(MentionListener(bot))
