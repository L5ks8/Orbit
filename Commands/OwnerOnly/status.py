import json
import pathlib
import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button

STATUS_FILE = pathlib.Path("Storage") / "bot_status.json"

def _save_status(act_type: str, text: str):
    try:
        if not STATUS_FILE.parent.exists():
            STATUS_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(STATUS_FILE, "w", encoding="utf-8") as f:
            json.dump({"type": act_type, "text": text}, f, indent=4)
    except Exception:
        pass

def _load_status() -> dict | None:
    if not STATUS_FILE.exists():
        return None
    try:
        with open(STATUS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return None


class StatusSuccessLayout(LayoutView):
    def __init__(self, act_type: str, text: str):
        super().__init__()
        display_str = f"`{act_type.upper()}` -> **{text}**" if act_type != "clear" else "`CLEARED (Default Presence)`"
        self.container = Container(
            TextDisplay(content="### Orbit Activity Status Updated"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**New Activity:** {display_str}\n\n*Status has been saved and will persist after restarts.*")
        )
        self.add_item(self.container)

        btn_close = Button(label="Close Notice", style=discord.ButtonStyle.secondary)

        async def _close_cb(interaction: discord.Interaction):
            try:
                await interaction.message.delete()
            except Exception:
                pass

        btn_close.callback = _close_cb
        self.add_item(ActionRow(btn_close))


class StatusCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_ready(self):
        data = _load_status()
        if data and "type" in data and "text" in data:
            await self._apply_presence(data["type"], data["text"])

    async def _apply_presence(self, act_type: str, text: str):
        t_clean = act_type.lower().strip()
        if t_clean in ["clear", "reset", "none"]:
            await self.bot.change_presence(activity=None)
            return

        if t_clean in ["play", "playing"]:
            act = discord.Game(name=text)
        elif t_clean in ["watch", "watching"]:
            act = discord.Activity(type=discord.ActivityType.watching, name=text)
        elif t_clean in ["listen", "listening"]:
            act = discord.Activity(type=discord.ActivityType.listening, name=text)
        elif t_clean in ["stream", "streaming"]:
            act = discord.Streaming(name=text, url="https://twitch.tv/discord")
        elif t_clean in ["compete", "competing"]:
            act = discord.Activity(type=discord.ActivityType.competing, name=text)
        else:
            act = discord.CustomActivity(name=f"{act_type} {text}".strip())

        await self.bot.change_presence(activity=act)

    @commands.command(name="status", description="Owner Only: Sets Orbit's Discord presence (`playing`, `watching`, `listening`, `streaming`, `reset`).")
    @commands.is_owner()
    async def status_cmd(self, ctx: commands.Context, act_type: str = None, *, text: str = ""):
        if not act_type or act_type.lower() in ["clear", "reset", "none"]:
            await self._apply_presence("clear", "")
            _save_status("clear", "")
            view = StatusSuccessLayout("clear", "")
            return await ctx.send(view=view)

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
            return await ctx.send("Please specify the status text (e.g. `-status watching 1,200 Members`).")

        await self._apply_presence(t_lower, text)
        _save_status(t_lower, text)
        view = StatusSuccessLayout(t_lower, text)
        await ctx.send(view=view)

    @status_cmd.error
    async def status_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.NotOwner):
            pass
        else:
            await ctx.send(f"Status error: {error}")


async def setup(bot: commands.Bot):
    await bot.add_cog(StatusCommand(bot))
