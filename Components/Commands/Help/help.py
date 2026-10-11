import discord
from discord import app_commands
from discord.ext import commands
from discord.ui import ActionRow, Button, Select
from Components.Commands._utils import make_embed



PAGES = [
    {
        "title": "Overview & Navigation",
        "description": (
            "**Welcome to Orbit Help!** Orbit is your all-in-one Discord moderation, voice, and engagement bot.\n\n"
            "**Command System:**\n"
            "> • **Slash Commands:** Orbit uses 100% Discord Slash Commands. Type `/` in your chat bar to browse, search, and run commands with real-time autocompletion.\n\n"
            "**Navigation:**\n"
            "Use the `Previous` and `Next` buttons below, or pick a specific command category from the dropdown selector to jump directly to that page!"
        )
    },
    {
        "title": "Moderation & Punishments",
        "description": (
            "**Server Moderation & Enforcement Commands:**\n\n"
            "• `/ban <user> [reason]` — Permanently ban a member.\n"
            "• `/unban <user_id> [reason]` — Unban a user by their Discord user ID.\n"
            "• `/kick <user> [reason]` — Kick a member from the server.\n"
            "• `/timeout <user> <duration> [reason]` — Mute/restrict a member for a set duration.\n"
            "• `/untimeout <user> [reason]` — Remove an active timeout.\n"
            "• `/mute <user> <duration> [reason]` — Assign the server Muted role.\n"
            "• `/unmute <user> [reason]` — Remove the Muted role.\n"
            "• `/purge <amount> [user]` — Bulk delete up to 100 messages."
        )
    },
    {
        "title": "Warning & Infraction System",
        "description": (
            "**Persistent Warning & Blacklist Management:**\n\n"
            "• `/warn <user> <reason>` — Issue a permanent warning to a member.\n"
            "• `/warnings <user>` — View a paginated card of all warnings for a member.\n"
            "• `/delwarn <user> <warn_id>` — Delete a specific warning ID.\n"
            "• `/clearwarnings <user>` — Remove all warnings from a member.\n"
            "• `/blacklist add <target>` — Block a user, channel, or role from using bot commands.\n"
            "• `/blacklist remove/list/check` — Manage and check server command blacklists."
        )
    },
    {
        "title": "Channel & Voice Management",
        "description": (
            "**Text & Voice Channel Controls:**\n\n"
            "• `/lock [channel] [reason]` — Lock a text channel.\n"
            "• `/unlock [channel]` — Unlock a text channel.\n"
            "• `/slowmode set <seconds> [channel]` — Set channel slowmode.\n"
            "• `/slowmode reset [channel]` — Remove channel slowmode.\n"
            "• `/voice lock [channel]` & `/voice unlock [channel]` — Lock or unlock a voice channel.\n"
            "• `/voice limit <limit> [channel]` — Set voice user limit.\n"
            "• `/voice ban <user>` & `/voice unban <user>` — Ban or unban a member from voice.\n"
            "• `/voice mute <user>` & `/voice unmute <user>` — Server-mute or unmute a member in voice.\n"
            "• `/voice move <user> <channel>` — Move a voice member."
        )
    },
    {
        "title": "Role & Auto-Join Systems",
        "description": (
            "**Server Role & AutoRole Configuration:**\n\n"
            "• `/role add <user> <role>` — Grant a role to a member.\n"
            "• `/role remove <user> <role>` — Remove a role from a member.\n"
            "• `/role info <role>` — Display detailed stats and permissions for a role.\n"
            "• `/role all <role>` & `/role rall <role>` — Give or take a role from ALL members.\n"
            "• `/role list` — Display a complete card listing all server roles and member counts."
        )
    },
    {
        "title": "Giveaways, Polls & Welcome",
        "description": (
            "**Community Engagement & Greetings:**\n\n"
            "• `/giveaway <duration> <winners> <prize>` — Start an interactive giveaway.\n"
            "• `/gend <giveaway_id>` — End a giveaway early and announce winners.\n"
            "• `/greroll <giveaway_id> [winners]` — Reroll new winners.\n"
            "• `/poll <question> <options> <duration>` — Create a multi-option poll.\n"
            "• `/fastpoll <question> [duration]` — Create a Yes/No poll.\n"
            "• `/pollclose <poll_id>` — Close a poll early.\n"
            "• `/welcome setup <#channel> [message]` — Enable custom welcome notifications.\n"
            "• `/welcome toggle/reset/status` — Toggle, reset, or view welcome system status."
        )
    },
    {
        "title": "Utility, Info & Media",
        "description": (
            "**Server Stats, User Info & Tools:**\n\n"
            "• `/serverinfo` — Display complete server statistics and creation details.\n"
            "• `/userinfo [user]` — Display member join dates and account history.\n"
            "• `/avatar [user]` & `/banner [user]` — Fetch high-res profile avatars and banners.\n"
            "• `/ping` — Check bot latency and WebSocket connection speed.\n"
            "• `/say <message>` — Repeat a message via the bot.\n"
            "• `/dm <user> <message>` — Direct message a member.\n"
            "• `/afk [reason]` & `/afkremove` — Set or clear your AFK status."
        )
    },
    {
        "title": "Invite Tracking & Management",
        "description": (
            "**Invite Stats & Code Management:**\n\n"
            "• `/invites [user]` — View a member's invite stats.\n"
            "• `/invitecodes [user]` — View all invite codes and their uses.\n"
            "• `/invitedlist [user]` — Display a paginated list of members invited by a user.\n"
            "• `/inviter [user]` — Find out who invited a specific member.\n"
            "• `/leaderboard invites` — View the top inviters in the server.\n"
            "• `/manage-invites add/remove` — Add or remove bonus invites for a user.\n"
            "• `/manage-invites addfake/removefake` — Manage fake invites.\n"
            "• `/manage-invites reset` — Reset invites for a user or the whole server.\n"
            "• `/manage-codes delete` — Delete a specific invite code.\n"
            "• `/manage-codes purge` — Bulk delete invite codes.\n"
            "• `/exportinvitedlist [user]` — Export an invite list to a CSV file."
        )
    },
    {
        "title": "Leveling System",
        "description": (
            "**Server XP & Ranks:**\n\n"
            "• `/rank [user]` — Check your or someone else's current level and XP.\n"
            "• `/leaderboard` — View the top most active members in the server.\n"
            "• `/xp add/remove/set/transfer` — Manage or transfer member XP."
        )
    },
    {
        "title": "Economy System",
        "description": (
            "**Global Currency & Virtual Economy:**\n\n"
            "• `/balance [user]` — View your wallet and bank balance.\n"
            "• `/work` — Work to earn some coins.\n"
            "• `/daily` — Claim your daily reward.\n"
            "• `/baltop` — View the richest members.\n"
            "• `/inventory` — View the items you own.\n"
            "• `/open_chest <chest_name>` — Open a reward chest."
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
            return await interaction.response.send_message(embed=make_embed("You cannot control this help panel.", discord.Color.red()), ephemeral=True)
        
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
                return await interaction.response.send_message(embed=make_embed("You cannot control this help panel.", discord.Color.red()), ephemeral=True)
            if self.current_page > 0:
                self.current_page -= 1
                await interaction.response.edit_message(**self.get_kwargs())

        async def next_cb(interaction: discord.Interaction):
            if interaction.user.id != self.author_id:
                return await interaction.response.send_message(embed=make_embed("You cannot control this help panel.", discord.Color.red()), ephemeral=True)
            if self.current_page < len(PAGES) - 1:
                self.current_page += 1
                await interaction.response.edit_message(**self.get_kwargs())

        async def close_cb(interaction: discord.Interaction):
            if interaction.user.id != self.author_id:
                return await interaction.response.send_message(embed=make_embed("You cannot control this help panel.", discord.Color.red()), ephemeral=True)
            try:
                await interaction.message.delete()
            except Exception:
                pass

        btn_prev.callback = prev_cb
        btn_next.callback = next_cb
        btn_close.callback = close_cb

        components = [select_menu, btn_prev, btn_page, btn_next, btn_close]

        embed = discord.Embed(
            title=f"Orbit Command Guide: {page['title']}",
            description=page["description"],
            color=discord.Color.blue()
        )
        if icon_url:
            embed.set_thumbnail(url=icon_url)
        embed.set_footer(text=f"Page {self.current_page + 1} of {len(PAGES)}")

        self.clear_items()
        for comp in components:
            self.add_item(comp)

        return {"embed": embed, "view": self}

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
        await ctx.send(embed=make_embed(f"An error occurred displaying help: {error}", discord.Color.red()), ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(HelpCommandCog(bot))
