import json
import pathlib
import discord
from discord.ext import commands
from discord.ui import View, Select, Modal, TextInput, Button

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
        from Commands._utils import make_embed
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
    if s in ["dnd", "do_not_disturb", "nicht stören", "nicht stoeren"]:
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
    def __init__(self, bot: commands.Bot, act_type: str, parent_view: "StatusInteractiveView"):
        super().__init__()
        self.bot = bot
        self.act_type = act_type
        self.parent_view = parent_view

        self.input_field = TextInput(
            label="Activity Text",
            style=discord.TextStyle.short,
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

        self.parent_view.current_type = self.act_type
        self.parent_view.current_text = text
        self.parent_view.current_status = curr_status_str
        
        try:
            await interaction.response.edit_message(embed=self.parent_view.get_embed(), view=self.parent_view)
        except Exception:
            try:
                await interaction.response.defer()
            except Exception:
                pass

class StatusInteractiveView(View):
    def __init__(self, bot: commands.Bot, current_type: str, current_text: str, current_status: str, author_id: int):
        super().__init__(timeout=None)
        self.bot = bot
        self.current_type = current_type
        self.current_text = current_text
        self.current_status = current_status
        self.author_id = author_id

        self.act_select = Select(
            placeholder="Select Activity Type (Playing, Watching...)",
            options=[
                discord.SelectOption(label="Playing", value="playing"),
                discord.SelectOption(label="Watching", value="watching"),
                discord.SelectOption(label="Listening", value="listening"),
                discord.SelectOption(label="Streaming", value="streaming"),
                discord.SelectOption(label="Competing", value="competing"),
                discord.SelectOption(label="Clear Activity", value="clear")
            ],
            row=0
        )

        async def _act_cb(interaction: discord.Interaction):
            if interaction.user.id != self.author_id:
                return await interaction.response.send_message(embed=make_embed("Not allowed.", discord.Color.red()), ephemeral=True)
            val = self.act_select.values[0]
            if val == "clear":
                data = _load_status() or {}
                curr_status_str = data.get("status", "online")
                discord_status = _parse_discord_status(curr_status_str)
                await self.bot.change_presence(activity=None, status=discord_status)
                _save_status("clear", "", curr_status_str)
                self.current_type = "clear"
                self.current_text = ""
                await interaction.response.edit_message(embed=self.get_embed(), view=self)
            else:
                modal = ActivityTextInputModal(self.bot, val, self)
                await interaction.response.send_modal(modal)

        self.act_select.callback = _act_cb
        self.add_item(self.act_select)

        self.status_select = Select(
            placeholder="Select Bot Presence (Online, Idle, DND...)",
            options=[
                discord.SelectOption(label="Online", value="online"),
                discord.SelectOption(label="Idle (Abwesend)", value="idle"),
                discord.SelectOption(label="Do Not Disturb", value="dnd"),
                discord.SelectOption(label="Invisible (Offline)", value="invisible")
            ],
            row=1
        )

        async def _stat_cb(interaction: discord.Interaction):
            if interaction.user.id != self.author_id:
                return await interaction.response.send_message(embed=make_embed("Not allowed.", discord.Color.red()), ephemeral=True)
            val = self.status_select.values[0]
            data = _load_status() or {}
            c_type = data.get("type", "clear")
            c_text = data.get("text", "")
            
            act = _build_activity(c_type, c_text)
            discord_status = _parse_discord_status(val)
            await self.bot.change_presence(activity=act, status=discord_status)
            _save_status(c_type, c_text, val)
            self.current_status = val
            await interaction.response.edit_message(embed=self.get_embed(), view=self)

        self.status_select.callback = _stat_cb
        self.add_item(self.status_select)

        btn_close = Button(label="Close Panel", style=discord.ButtonStyle.secondary, row=2)
        async def _close_cb(interaction: discord.Interaction):
            if interaction.user.id != self.author_id:
                return await interaction.response.send_message(embed=make_embed("Not allowed.", discord.Color.red()), ephemeral=True)
            try:
                await interaction.message.delete()
            except Exception:
                pass
        btn_close.callback = _close_cb
        self.add_item(btn_close)

    def get_embed(self) -> discord.Embed:
        d_type = self.current_type.title() if self.current_type != "clear" else "None"
        d_text = self.current_text if self.current_text else "None"
        d_status = self.current_status.upper()
        
        return discord.Embed(
            title="Orbit Activity & Presence Hub",
            description=f"**Current Status:** `{d_status}`\n**Activity Type:** `{d_type}`\n**Activity Text:** `{d_text}`",
            color=0x2B2D31
        )

class StatusCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="status", description="Owner Only: Interactive V2 panel or direct shortcut to set activity and presence.")
    @commands.is_owner()
    async def status_cmd(self, ctx: commands.Context, type_arg: str = None, *, text_arg: str = None):
        if type_arg:
            clean_type = type_arg.lower().strip()
            text = text_arg.strip() if text_arg else ""
            
            if clean_type in ["online", "idle", "dnd", "invisible"]:
                data = _load_status() or {}
                c_type = data.get("type", "clear")
                c_text = data.get("text", "")
                
                act = _build_activity(c_type, c_text)
                discord_status = _parse_discord_status(clean_type)
                await self.bot.change_presence(activity=act, status=discord_status)
                _save_status(c_type, c_text, clean_type)
                
                embed = discord.Embed(
                    title="Presence Updated",
                    description=f"Bot presence updated to `{clean_type.upper()}`",
                    color=0x2B2D31
                )
                await ctx.send(embed=embed)
                return

            data = _load_status() or {}
            curr_status_str = data.get("status", "online")
            act = _build_activity(clean_type, text)
            discord_status = _parse_discord_status(curr_status_str)
            await self.bot.change_presence(activity=act, status=discord_status)
            _save_status(clean_type, text, curr_status_str)
            
            embed = discord.Embed(
                title="Activity Updated",
                description=f"Bot activity updated to `{clean_type.title()} {text}`",
                color=0x2B2D31
            )
            await ctx.send(embed=embed)
            return

        data = _load_status() or {}
        curr_type = data.get("type", "clear")
        curr_text = data.get("text", "")
        curr_status_str = data.get("status", "online")
        
        view = StatusInteractiveView(self.bot, curr_type, curr_text, curr_status_str, ctx.author.id)
        if ctx.guild is not None:
            try:
                await ctx.message.delete()
            except Exception:
                pass
        await ctx.send(embed=view.get_embed(), view=view, allowed_mentions=discord.AllowedMentions.none())

    @status_cmd.error
    async def status_error(self, ctx: commands.Context, error):
        if not isinstance(error, commands.NotOwner):
            await ctx.send(embed=make_embed(f"Status Error: {error}", discord.Color.red()))

async def setup(bot: commands.Bot):
    await bot.add_cog(StatusCommand(bot))