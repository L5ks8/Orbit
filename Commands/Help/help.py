utf-8import discord
from discord import app_commands
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button, Select

def _create_thumbnail(url: str):
    Thumbnail = getattr(discord.ui, "Thumbnail", None)
    if not Thumbnail:
        return None
    try:
        return Thumbnail(media=url)
    except TypeError:
        try:
            return Thumbnail(url=url)
        except Exception:
            try:
                return Thumbnail(url)
            except Exception:
                return None

PAGES = [
    {
        "title": "Overview & Navigation",
        "description": (
            "**Welcome to Orbit Help!** Orbit is your all-in-one Discord moderation, voice, and engagement bot.\n\n"
            "**Command Prefixes:**\n"
            "> • **Slash Commands:** Type `/` to see all available slash commands with auto-completion.\n"
            "> • **Prefix Commands:** Use `-command` (or `@Orbit command`).\n\n"
            "**Navigation:**\n"
            "Use the `Previous` and `Next` buttons below, or pick a specific command category from the dropdown selector to jump directly to that page!"
        )
    },
    {
        "title": "Moderation & Punishments",
        "description": (
            "**Server Moderation & Enforcement Commands:**\n\n"
            "• `/ban <user> [reason]` — Permanently ban a member (`-ban @user Spam`).\n"
            "• `/unban <user_id> [reason]` — Unban a user by their Discord user ID (`-unban 123456789`).\n"
            "• `/kick <user> [reason]` — Kick a member from the server (`-kick @user`).\n"
            "• `/timeout <user> <duration> [reason]` — Mute/restrict a member (`-timeout @user 10m`).\n"
            "• `/untimeout <user> [reason]` — Remove an active timeout (`-untimeout @user`).\n"
            "• `/mute <user> <duration> [reason]` — Assign the server Muted role (`-mute @user 1h`).\n"
            "• `/unmute <user> [reason]` — Remove the Muted role (`-unmute @user`).\n"
            "• `/purge <amount> [user]` — Bulk delete up to 100 messages (`-purge 50 @user`)."
        )
    },
    {
        "title": "Warning & Infraction System",
        "description": (
            "**Persistent Warning & Blacklist Management:**\n\n"
            "• `/warn <user> <reason>` — Issue a permanent warning (`-warn @user Rule 3 violation`).\n"
            "• `/warnings <user>` — View a paginated card of all warnings for a member (`-warnings @user`).\n"
            "• `/delwarn <user> <warn_id>` — Delete a specific warning ID (`-delwarn @user W-1234`).\n"
            "• `/clearwarnings <user>` — Remove all warnings from a member (`-clearwarnings @user`).\n"
            "• `/blacklist add <target>` — Block a user, channel, or role from using bot commands.\n"
            "• `/blacklist remove/list/check` — Manage and check server command blacklists."
        )
    },
    {
        "title": "Channel & Voice Management",
        "description": (
            "**Text & Voice Channel Controls:**\n\n"
            "• `/lock [channel] [reason]` — Lock a text channel (`-lock #general`).\n"
            "• `/unlock [channel]` — Unlock a text channel (`-unlock #general`).\n"
            "• `/slowmodeset <seconds> [channel]` — Set channel slowmode (`-slowmodeset 10 #general`).\n"
            "• `/slowmoderemove [channel]` — Remove channel slowmode (`-slowmoderemove #general`).\n"
            "• `/vclock [channel]` & `/vcunlock [channel]` — Lock or unlock a voice channel (`-vclock`).\n"
            "• `/vclimit <limit> [channel]` — Set voice user limit (`-vclimit 5`).\n"
            "• `/vcban <user>` & `/vcunban <user>` — Ban or unban a member from voice (`-vcban @user`).\n"
            "• `/vcmute <user>` & `/vcunmute <user>` — Server-mute or unmute a member in voice.\n"
            "• `/move <user> <channel>` — Move a voice member (`-move @user #voice-2`)."
        )
    },
    {
        "title": "Role & Auto-Join Systems",
        "description": (
            "**Server Role & AutoRole Configuration:**\n\n"
            "• `/addrole <user> <role>` — Grant a role to a member (`-addrole @user @Member`).\n"
            "• `/removerole <user> <role>` — Remove a role from a member (`-removerole @user @Member`).\n"
            "• `/roleinfo <role>` — Display detailed stats and permissions for a role (`-roleinfo @Member`).\n"
            "• `/role all <role>` & `/role rall <role>` — Give or take a role from ALL members (`-role all @Update`).\n"
            "• `/allroles` — Display a complete card listing all server roles and member counts (`-allroles`).\n"
            "• `/joinrole add <role>` — Add a role given automatically upon joining (`-joinrole add @Member`).\n"
            "• `/joinrole remove <role>` & `/joinrole list` — Remove or list automatic join roles."
        )
    },
    {
        "title": "Giveaways, Polls & Welcome",
        "description": (
            "**Community Engagement & Greetings:**\n\n"
            "• `/giveaway <duration> <winners> <prize>` — Start an interactive giveaway (`-giveaway 1d 1 Nitro`).\n"
            "• `/gend <giveaway_id>` — End a giveaway early and announce winners (`-gend G-849201`).\n"
            "• `/greroll <giveaway_id> [winners]` — Reroll new winners (`-greroll G-849201 1`).\n"
            "• `/poll <question> <options> <duration>` — Create a multi-option poll (`-poll 'Color?' 'Red,Blue' 1h`).\n"
            "• `/fastpoll <question> [duration]` — Create a Yes/No poll (`-fastpoll 'Good bot?' 24h`).\n"
            "• `/pollclose <poll_id>` — Close a poll early (`-pollclose P-849201`).\n"
            "• `/welcome setup <#channel> [message]` — Enable custom welcome notifications (`-welcome setup #welcome`).\n"
            "• `/welcome toggle/reset/status` — Toggle, reset, or view welcome system status."
        )
    },
    {
        "title": "Utility, Info & Media",
        "description": (
            "**Server Stats, User Info & Tools:**\n\n"
            "• `/serverinfo` — Display complete server statistics and creation details (`-serverinfo`).\n"
            "• `/userinfo [user]` — Display member join dates and account history (`-userinfo @user`).\n"
            "• `/avatar [user]` & `/banner [user]` — Fetch high-res profile avatars and banners (`-avatar @user`).\n"
            "• `/ping` — Check bot latency and WebSocket connection speed (`-ping`).\n"
            "• `/say <message>` — Repeat a message (`-say Hello world`).\n"
            "• `/dm <user> <message>` — Direct message a member (`-dm @user Check this out`).\n"
            "• `/afk [reason]` & `/afkremove` — Set or clear your AFK status (`-afk Sleeping`)."
        )
    }
]

class HelpCategorySelect(Select):
    def __init__(self, parent_view: "HelpLayout"):
        self.parent_view = parent_view
        options = [
            discord.SelectOption(
                label=page["title"],
                description=f"View commands inside {page['title'].split(' ', 1)[-1]}",
                value=str(idx),
                default=(idx == parent_view.current_page)
            )
            for idx, page in enumerate(PAGES)
        ]
        super().__init__(placeholder="Jump directly to a category...", options=options)

    async def callback(self, interaction: discord.Interaction):
        if interaction.user.id != self.parent_view.author_id:
            return await interaction.response.send_message("You cannot control this help panel.", ephemeral=True)
        
        page_idx = int(self.values[0])
        self.parent_view.current_page = page_idx
        self.parent_view.build_ui()
        await interaction.response.edit_message(view=self.parent_view)

class HelpLayout(LayoutView):
    def __init__(self, bot: commands.Bot, author_id: int, current_page: int = 0):
        super().__init__(timeout=300)
        self.bot = bot
        self.author_id = author_id
        self.current_page = current_page
        self.build_ui()

    def build_ui(self):
        self.clear_items()
        page = PAGES[self.current_page]
        
        header_str = f"### Orbit Command Guide: **{page['title']}**\n**Page:** `{self.current_page + 1} / {len(PAGES)}`"
        info_str = page["description"]

        icon_url = self.bot.user.avatar.with_size(256).url if (self.bot.user and self.bot.user.avatar) else None
        thumbnail = _create_thumbnail(icon_url) if icon_url else None
        Section = getattr(discord.ui, "Section", None)

        if thumbnail and Section:
            try:
                top_section = Section(TextDisplay(content=header_str), accessory=thumbnail)
                items = [
                    top_section,
                    Separator(spacing=discord.SeparatorSpacing.small),
                    TextDisplay(content=info_str),
                    Separator(spacing=discord.SeparatorSpacing.small)
                ]
            except Exception:
                items = [
                    TextDisplay(content=header_str),
                    Separator(spacing=discord.SeparatorSpacing.small),
                    TextDisplay(content=info_str),
                    Separator(spacing=discord.SeparatorSpacing.small)
                ]
        else:
            items = [
                TextDisplay(content=header_str),
                Separator(spacing=discord.SeparatorSpacing.small),
                TextDisplay(content=info_str),
                Separator(spacing=discord.SeparatorSpacing.small)
            ]

        select_menu = HelpCategorySelect(self)
        items.append(ActionRow(select_menu))

        btn_prev = Button(label="Previous", style=discord.ButtonStyle.secondary, disabled=(self.current_page == 0))
        btn_page = Button(label=f"Page {self.current_page + 1}/{len(PAGES)}", style=discord.ButtonStyle.primary, disabled=True)
        btn_next = Button(label="Next", style=discord.ButtonStyle.secondary, disabled=(self.current_page == len(PAGES) - 1))
        btn_close = Button(label="Close", style=discord.ButtonStyle.danger)

        async def prev_cb(interaction: discord.Interaction):
            if interaction.user.id != self.author_id:
                return await interaction.response.send_message("You cannot control this help panel.", ephemeral=True)
            if self.current_page > 0:
                self.current_page -= 1
                self.build_ui()
                await interaction.response.edit_message(view=self)

        async def next_cb(interaction: discord.Interaction):
            if interaction.user.id != self.author_id:
                return await interaction.response.send_message("You cannot control this help panel.", ephemeral=True)
            if self.current_page < len(PAGES) - 1:
                self.current_page += 1
                self.build_ui()
                await interaction.response.edit_message(view=self)

        async def close_cb(interaction: discord.Interaction):
            if interaction.user.id != self.author_id:
                return await interaction.response.send_message("You cannot control this help panel.", ephemeral=True)
            try:
                await interaction.message.delete()
            except Exception:
                self.clear_items()
                self.add_item(Container(TextDisplay(content="### Help menu closed.")))
                await interaction.response.edit_message(view=self)
                self.stop()

        btn_prev.callback = prev_cb
        btn_next.callback = next_cb
        btn_close.callback = close_cb

        items.append(ActionRow(btn_prev, btn_page, btn_next, btn_close))
        self.container = Container(*items)
        self.add_item(self.container)

class HelpCommandCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="help", description="Displays an interactive paginated guide of all Orbit commands.")
    async def help_cmd(self, ctx: commands.Context):
        await ctx.defer()
        view = HelpLayout(self.bot, ctx.author.id, 0)
        await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

    @help_cmd.error
    async def help_error(self, ctx: commands.Context, error):
        await ctx.send(f"An error occurred displaying help: {error}", ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(HelpCommandCog(bot))
