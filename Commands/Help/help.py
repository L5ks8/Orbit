import discord
from discord import app_commands
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button, Select



PAGES = [
    {
        "title": "Overview & Navigation",
        "description": (
            "**Welcome to Orbit Help!** Orbit is your all-in-one Discord moderation, voice, and engagement bot.\n\n"
            "**Command Prefixes:**\n"
            "> â€¢ **Slash Commands:** Type `/` to see all available slash commands with auto-completion.\n"
            "> â€¢ **Prefix Commands:** Use `-command` (or `@Orbit command`).\n\n"
            "**Navigation:**\n"
            "Use the `Previous` and `Next` buttons below, or pick a specific command category from the dropdown selector to jump directly to that page!"
        )
    },
    {
        "title": "Moderation & Punishments",
        "description": (
            "**Server Moderation & Enforcement Commands:**\n\n"
            "â€¢ `/ban <user> [reason]` â€” Permanently ban a member (`-ban @user Spam`).\n"
            "â€¢ `/unban <user_id> [reason]` â€” Unban a user by their Discord user ID (`-unban 123456789`).\n"
            "â€¢ `/kick <user> [reason]` â€” Kick a member from the server (`-kick @user`).\n"
            "â€¢ `/timeout <user> <duration> [reason]` â€” Mute/restrict a member (`-timeout @user 10m`).\n"
            "â€¢ `/untimeout <user> [reason]` â€” Remove an active timeout (`-untimeout @user`).\n"
            "â€¢ `/mute <user> <duration> [reason]` â€” Assign the server Muted role (`-mute @user 1h`).\n"
            "â€¢ `/unmute <user> [reason]` â€” Remove the Muted role (`-unmute @user`).\n"
            "â€¢ `/purge <amount> [user]` â€” Bulk delete up to 100 messages (`-purge 50 @user`)."
        )
    },
    {
        "title": "Warning & Infraction System",
        "description": (
            "**Persistent Warning & Blacklist Management:**\n\n"
            "â€¢ `/warn <user> <reason>` â€” Issue a permanent warning (`-warn @user Rule 3 violation`).\n"
            "â€¢ `/warnings <user>` â€” View a paginated card of all warnings for a member (`-warnings @user`).\n"
            "â€¢ `/delwarn <user> <warn_id>` â€” Delete a specific warning ID (`-delwarn @user W-1234`).\n"
            "â€¢ `/clearwarnings <user>` â€” Remove all warnings from a member (`-clearwarnings @user`).\n"
            "â€¢ `/blacklist add <target>` â€” Block a user, channel, or role from using bot commands.\n"
            "â€¢ `/blacklist remove/list/check` â€” Manage and check server command blacklists."
        )
    },
    {
        "title": "Channel & Voice Management",
        "description": (
            "**Text & Voice Channel Controls:**\n\n"
            "â€¢ `/lock [channel] [reason]` â€” Lock a text channel (`-lock #general`).\n"
            "â€¢ `/unlock [channel]` â€” Unlock a text channel (`-unlock #general`).\n"
            "â€¢ `/slowmodeset <seconds> [channel]` â€” Set channel slowmode (`-slowmodeset 10 #general`).\n"
            "â€¢ `/slowmoderemove [channel]` â€” Remove channel slowmode (`-slowmoderemove #general`).\n"
            "â€¢ `/vclock [channel]` & `/vcunlock [channel]` â€” Lock or unlock a voice channel (`-vclock`).\n"
            "â€¢ `/vclimit <limit> [channel]` â€” Set voice user limit (`-vclimit 5`).\n"
            "â€¢ `/vcban <user>` & `/vcunban <user>` â€” Ban or unban a member from voice (`-vcban @user`).\n"
            "â€¢ `/vcmute <user>` & `/vcunmute <user>` â€” Server-mute or unmute a member in voice.\n"
            "â€¢ `/move <user> <channel>` â€” Move a voice member (`-move @user #voice-2`)."
        )
    },
    {
        "title": "Role & Auto-Join Systems",
        "description": (
            "**Server Role & AutoRole Configuration:**\n\n"
            "â€¢ `/addrole <user> <role>` â€” Grant a role to a member (`-addrole @user @Member`).\n"
            "â€¢ `/removerole <user> <role>` â€” Remove a role from a member (`-removerole @user @Member`).\n"
            "â€¢ `/roleinfo <role>` â€” Display detailed stats and permissions for a role (`-roleinfo @Member`).\n"
            "â€¢ `/role all <role>` & `/role rall <role>` â€” Give or take a role from ALL members (`-role all @Update`).\n"
            "â€¢ `/allroles` â€” Display a complete card listing all server roles and member counts (`-allroles`).\n"
            "â€¢ `/joinrole add <role>` â€” Add a role given automatically upon joining (`-joinrole add @Member`).\n"
            "â€¢ `/joinrole remove <role>` & `/joinrole list` â€” Remove or list automatic join roles."
        )
    },
    {
        "title": "Giveaways, Polls & Welcome",
        "description": (
            "**Community Engagement & Greetings:**\n\n"
            "â€¢ `/giveaway <duration> <winners> <prize>` â€” Start an interactive giveaway (`-giveaway 1d 1 Nitro`).\n"
            "â€¢ `/gend <giveaway_id>` â€” End a giveaway early and announce winners (`-gend G-849201`).\n"
            "â€¢ `/greroll <giveaway_id> [winners]` â€” Reroll new winners (`-greroll G-849201 1`).\n"
            "â€¢ `/poll <question> <options> <duration>` â€” Create a multi-option poll (`-poll 'Color?' 'Red,Blue' 1h`).\n"
            "â€¢ `/fastpoll <question> [duration]` â€” Create a Yes/No poll (`-fastpoll 'Good bot?' 24h`).\n"
            "â€¢ `/pollclose <poll_id>` â€” Close a poll early (`-pollclose P-849201`).\n"
            "â€¢ `/welcome setup <#channel> [message]` â€” Enable custom welcome notifications (`-welcome setup #welcome`).\n"
            "â€¢ `/welcome toggle/reset/status` â€” Toggle, reset, or view welcome system status."
        )
    },
    {
        "title": "Utility, Info & Media",
        "description": (
            "**Server Stats, User Info & Tools:**\n\n"
            "â€¢ `/serverinfo` â€” Display complete server statistics and creation details (`-serverinfo`).\n"
            "â€¢ `/userinfo [user]` â€” Display member join dates and account history (`-userinfo @user`).\n"
            "â€¢ `/avatar [user]` & `/banner [user]` â€” Fetch high-res profile avatars and banners (`-avatar @user`).\n"
            "â€¢ `/ping` â€” Check bot latency and WebSocket connection speed (`-ping`).\n"
            "â€¢ `/say <message>` â€” Repeat a message (`-say Hello world`).\n"
            "â€¢ `/dm <user> <message>` â€” Direct message a member (`-dm @user Check this out`).\n"
            "â€¢ `/afk [reason]` & `/afkremove` â€” Set or clear your AFK status (`-afk Sleeping`)."
        )
    }
]

class HelpCategorySelect(discord.ui.Select):
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
        await interaction.response.edit_message(**self.parent_view.get_kwargs())

class HelpLayout(discord.ui.View):
    def __init__(self, bot: commands.Bot, author_id: int, guild_id: int = None, current_page: int = 0):
        super().__init__(timeout=300)
        self.bot = bot
        self.author_id = author_id
        self.guild_id = guild_id or 0
        self.current_page = current_page

    def get_kwargs(self):
        page = PAGES[self.current_page]
        icon_url = self.bot.user.avatar.with_size(256).url if (self.bot.user and self.bot.user.avatar) else None

        select_menu = HelpCategorySelect(self)

        btn_prev = discord.ui.Button(label="Previous", style=discord.ButtonStyle.secondary, disabled=(self.current_page == 0))
        btn_page = discord.ui.Button(label=f"Page {self.current_page + 1}/{len(PAGES)}", style=discord.ButtonStyle.primary, disabled=True)
        btn_next = discord.ui.Button(label="Next", style=discord.ButtonStyle.secondary, disabled=(self.current_page == len(PAGES) - 1))
        btn_close = discord.ui.Button(label="Close", style=discord.ButtonStyle.danger)

        async def prev_cb(interaction: discord.Interaction):
            if interaction.user.id != self.author_id:
                return await interaction.response.send_message("You cannot control this help panel.", ephemeral=True)
            if self.current_page > 0:
                self.current_page -= 1
                await interaction.response.edit_message(**self.get_kwargs())

        async def next_cb(interaction: discord.Interaction):
            if interaction.user.id != self.author_id:
                return await interaction.response.send_message("You cannot control this help panel.", ephemeral=True)
            if self.current_page < len(PAGES) - 1:
                self.current_page += 1
                await interaction.response.edit_message(**self.get_kwargs())

        async def close_cb(interaction: discord.Interaction):
            if interaction.user.id != self.author_id:
                return await interaction.response.send_message("You cannot control this help panel.", ephemeral=True)
            try:
                await interaction.message.delete()
            except Exception:
                pass

        btn_prev.callback = prev_cb
        btn_next.callback = next_cb
        btn_close.callback = close_cb

        components = [select_menu, btn_prev, btn_page, btn_next, btn_close]

        from Embeds import get_command_embed
        return get_command_embed(
            self.guild_id, "help", msg_type="page",
            page_data=page, current_page=self.current_page,
            total_pages=len(PAGES), icon_url=icon_url,
            components=components
        )

class HelpCommandCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="help", description="Displays an interactive paginated guide of all Orbit commands.")
    async def help_cmd(self, ctx: commands.Context):
        await ctx.defer()
        view = HelpLayout(self.bot, ctx.author.id, ctx.guild.id if ctx.guild else 0, 0)
        await ctx.send(**view.get_kwargs(), allowed_mentions=discord.AllowedMentions.none())

    @help_cmd.error
    async def help_error(self, ctx: commands.Context, error):
        await ctx.send(f"An error occurred displaying help: {error}", ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(HelpCommandCog(bot))

