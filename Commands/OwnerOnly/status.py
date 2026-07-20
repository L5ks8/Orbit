import json
import pathlib
import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button, Select, Modal, TextInput

def _save_status(act_type: str, text: str, status_str: str = "online"):
    try:
        from Database.mongodb import get_db
        db = get_db()
        if db is not None:
            db["OwnerOnly_BotStatus"].update_one(
                {"_id": "GLOBAL"},
                {"$set": {
                    "type": act_type,
                    "text": text,
                    "status": status_str
                }},
                upsert=True
            )
    except Exception:
        pass

def _load_status() -> dict | None:
    try:
        from Database.mongodb import get_db
        db = get_db()
        if db is not None:
            doc = db["OwnerOnly_BotStatus"].find_one({"_id": "GLOBAL"})
            if doc:
                return doc
    except Exception:
        pass
    return None

def _parse_discord_status(status_str: str) -> discord.Status:
    s = status_str.lower().strip()
    if s in ["idle", "abwesend"]:
        return discord.Status.idle
    if s in ["dnd", "do_not_disturb", "nicht stÃ¶ren", "nicht stoeren"]:
        return discord.Status.dnd
    if s in ["invisible", "offline", "unsichtbar"]:
        return discord.Status.invisible
    return discord.Status.online

def _build_activity(act_type: str, text: str) -> discord.BaseActivity | None:
    t_clean = act_type.lower().strip()
    if t_clean in ["clear", "reset", "none"] or not text:
        return None
    if t_clean in ["play", "playing"]:
        return discord.Game(name=text)
    if t_clean in ["watch", "watching"]:
        return discord.Activity(type=discord.ActivityType.watching, name=text)
    if t_clean in ["listen", "listening"]:
        return discord.Activity(type=discord.ActivityType.listening, name=text)
    if t_clean in ["stream", "streaming"]:
        return discord.Streaming(name=text, url="https://twitch.tv/discord")
    if t_clean in ["compete", "competing"]:
        return discord.Activity(type=discord.ActivityType.competing, name=text)
    return discord.CustomActivity(name=f"{act_type} {text}".strip())

class ActivityTextInputModal(Modal, title="Set Activity Text"):
    def __init__(self, bot: commands.Bot, act_type: str, parent_view: "StatusInteractiveLayout"):
        super().__init__()
        self.bot = bot
        self.act_type = act_type
        self.parent_view = parent_view

        self.input_field = TextInput(
            label="Option 2: Activity Text",
            placeholder="e.g. over 1,200 Discord servers",
            required=True,
            max_length=120
        )
        self.add_item(self.input_field)

    async def on_submit(self, interaction: discord.Interaction):
        text = self.input_field.value.strip()
        data = _load_status() or {}
        curr_status_str = data.get("status", "online")
        
        act = _build_activity(self.act_type, text)
        discord_status = _parse_discord_status(curr_status_str)
        await self.bot.change_presence(activity=act, status=discord_status)
        _save_status(self.act_type, text, curr_status_str)

        self.parent_view.update_displays(self.act_type, text, curr_status_str)
        try:
            await interaction.response.edit_message(view=self.parent_view)
        except Exception:
            try:
                await interaction.response.defer()
            except Exception:
                pass

class StatusInteractiveLayout(LayoutView):
    def __init__(self, bot: commands.Bot, current_type: str, current_text: str, current_status: str):
        super().__init__(timeout=None)
        self.bot = bot
        self.current_type = current_type
        self.current_text = current_text
        self.current_status = current_status

        self.display_item = TextDisplay(content="")
        self.container = Container(
            TextDisplay(content="### Orbit Activity & Presence Hub"),
            Separator(spacing=discord.SeparatorSpacing.small),
            self.display_item
        )
        self.add_item(self.container)
        self.update_displays(current_type, current_text, current_status)

        act_select = Select(
            placeholder="Option 1: Select Activity Type (Playing, Watching...)",
            options=[
                discord.SelectOption(label="Playing", description="Set game activity (e.g. Playing Orbit V2)", value="playing"),
                discord.SelectOption(label="Watching", description="Set watching activity (e.g. Watching 50 servers)", value="watching"),
                discord.SelectOption(label="Listening", description="Set listening activity (e.g. Listening to commands)", value="listening"),
                discord.SelectOption(label="Streaming", description="Set streaming indicator (e.g. Streaming Orbit live)", value="streaming"),
                discord.SelectOption(label="Competing", description="Set competing activity (e.g. Competing in accuracy)", value="competing"),
                discord.SelectOption(label="Clear Activity", description="Remove activity text and reset presence text", value="clear")
            ]
        )

        async def _act_cb(interaction: discord.Interaction):
            val = act_select.values[0]
            if val == "clear":
                data = _load_status() or {}
                curr_status_str = data.get("status", "online")
                discord_status = _parse_discord_status(curr_status_str)
                await self.bot.change_presence(activity=None, status=discord_status)
                _save_status("clear", "", curr_status_str)
                self.update_displays("clear", "", curr_status_str)
                await interaction.response.edit_message(view=self)
            else:
                modal = ActivityTextInputModal(self.bot, val, self)
                await interaction.response.send_modal(modal)

        act_select.callback = _act_cb
        self.add_item(ActionRow(act_select))

        status_select = Select(
            placeholder="Option 3: Select Bot Presence (Online, Idle, DND...)",
            options=[
                discord.SelectOption(label="Online", description="Set indicator to Online", value="online"),
                discord.SelectOption(label="Idle (Abwesend)", description="Set indicator to Idle", value="idle"),
                discord.SelectOption(label="Do Not Disturb (Nicht stoeren)", description="Set indicator to DND", value="dnd"),
                discord.SelectOption(label="Invisible (Offline)", description="Set indicator to Invisible / Offline", value="invisible")
            ]
        )

        async def _status_cb(interaction: discord.Interaction):
            val = status_select.values[0]
            data = _load_status() or {}
            curr_type = data.get("type", "clear")
            curr_text = data.get("text", "")
            act = _build_activity(curr_type, curr_text)
            discord_status = _parse_discord_status(val)
            await self.bot.change_presence(activity=act, status=discord_status)
            _save_status(curr_type, curr_text, val)
            self.update_displays(curr_type, curr_text, val)
            await interaction.response.edit_message(view=self)

        status_select.callback = _status_cb
        self.add_item(ActionRow(status_select))

        btn_close = Button(label="Close Status Panel", style=discord.ButtonStyle.secondary)

        async def _close_cb(interaction: discord.Interaction):
            try:
                await interaction.message.delete()
            except Exception:
                pass

        btn_close.callback = _close_cb
        self.add_item(ActionRow(btn_close))

    def update_displays(self, act_type: str, text: str, status_str: str):
        self.current_type = act_type
        self.current_text = text
        self.current_status = status_str

        act_display = f"`{act_type.upper()}` -> **{text}**" if act_type not in ["clear", "reset", "none"] and text else "`CLEARED (No Activity)`"
        content = (
            f"**Current Activity:** {act_display}\n"
            f"**Current Presence:** `{status_str.upper()}`\n\n"
            "*Use the dropdown menus below to update Option 1 (Activity Type), Option 2 (Activity Text), or Option 3 (Bot Presence Status).* "
            "*All changes persist across reloads and restarts.*"
        )
        self.display_item.content = content

class StatusCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_ready(self):
        data = _load_status()
        if data and isinstance(data, dict):
            act_type = data.get("type", "clear")
            text = data.get("text", "")
            status_str = data.get("status", "online")
            act = _build_activity(act_type, text)
            discord_status = _parse_discord_status(status_str)
            await self.bot.change_presence(activity=act, status=discord_status)

    @commands.command(name="status", description="Owner Only: Interactive V2 panel or direct shortcut to set activity and presence.")
    @commands.is_owner()
    async def status_cmd(self, ctx: commands.Context, act_type: str = None, *, text: str = ""):
        data = _load_status() or {}
        curr_status_str = data.get("status", "online")

        if not act_type:
            curr_type = data.get("type", "clear")
            curr_text = data.get("text", "")
            view = StatusInteractiveLayout(self.bot, curr_type, curr_text, curr_status_str)
            return await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

        if act_type.lower() in ["clear", "reset", "none"]:
            discord_status = _parse_discord_status(curr_status_str)
            await self.bot.change_presence(activity=None, status=discord_status)
            _save_status("clear", "", curr_status_str)
            view = StatusInteractiveLayout(self.bot, "clear", "", curr_status_str)
            return await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

        valid_types = ["playing", "watching", "listening", "streaming", "competing"]
        t_lower = act_type.lower()
        if t_lower == "play": t_lower = "playing"
        elif t_lower == "watch": t_lower = "watching"
        elif t_lower == "listen": t_lower = "listening"
        elif t_lower == "stream": t_lower = "streaming"
        elif t_lower == "compete": t_lower = "competing"

        if t_lower not in valid_types:
            text = f"{act_type} {text}".strip()
            t_lower = "playing"

        if not text.strip():
            view = StatusInteractiveLayout(self.bot, data.get("type", "clear"), data.get("text", ""), curr_status_str)
            return await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

        act = _build_activity(t_lower, text)
        discord_status = _parse_discord_status(curr_status_str)
        await self.bot.change_presence(activity=act, status=discord_status)
        _save_status(t_lower, text, curr_status_str)
        view = StatusInteractiveLayout(self.bot, t_lower, text, curr_status_str)
        await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

    @status_cmd.error
    async def status_error(self, ctx: commands.Context, error):
        if not isinstance(error, commands.NotOwner):
            await ctx.send(f"Status error: {error}", allowed_mentions=discord.AllowedMentions.none())

async def setup(bot: commands.Bot):
    await bot.add_cog(StatusCommand(bot))

