import discord
from discord.ext import commands
import os

ORBIT_COLOR = discord.Color(0x5865F2)

try:
    from discord.ui import Button, Container, TextDisplay, ActionRow, LayoutView, Separator
    HAS_V2 = True
except ImportError:
    HAS_V2 = False
    LayoutView = discord.ui.View
    Container = None
    TextDisplay = None
    ActionRow = None
    Separator = None

def make_embed(description: str, color: discord.Color = ORBIT_COLOR, title: str = None) -> discord.Embed:
    actual_color = ORBIT_COLOR if color is None or color in (discord.Color.red(), discord.Color.green(), discord.Color.orange(), discord.Color.dark_gray()) else color
    embed = discord.Embed(description=description, color=actual_color)
    if title:
        embed.title = title
    return embed

def make_v2_card(body: str, *components, color: discord.Color = ORBIT_COLOR, footer: str = None) -> LayoutView | None:
    if not HAS_V2:
        return None
    actual_color = ORBIT_COLOR if color is None or color in (discord.Color.red(), discord.Color.green(), discord.Color.orange(), discord.Color.dark_gray()) else color
    view = LayoutView(timeout=None)
    items = [TextDisplay(content=body)]
    for comp in components:
        if isinstance(comp, ActionRow):
            items.append(comp)
        elif isinstance(comp, (list, tuple)):
            items.append(ActionRow(*comp))
        elif comp is not None:
            items.append(comp)
    container = Container(*items, accent_color=actual_color)
    view.add_item(container)
    if footer:
        view.add_item(TextDisplay(content=f"-# {footer}"))
    return view

class ModuleDisabledView(discord.ui.View):
    def __init__(self, guild_id: int, module_name: str):
        super().__init__()
        tab_name = module_name.lower()
        if tab_name == "leveling":
            tab_name = "level"
        base_url = os.environ.get("BASE_URL", "http://localhost:3000").rstrip("/")
        self.add_item(discord.ui.Button(label="Activate Module", style=discord.ButtonStyle.link, url=f"{base_url}/dashboard/{guild_id}/modules/{tab_name}"))

def get_module_disabled_embed(module_name: str) -> discord.Embed:
    from Components.emojis import Emojis
    return discord.Embed(
        description=f"The {module_name} module must be activated to use this command.",
        color=discord.Color.red()
    )

def format_usage(command: str, *args: str) -> str:
    cmd_name = command.lstrip("/-")
    usage = f"Usage: /{cmd_name}"
    if args:
        usage += " " + " ".join(args)
    return usage

class MemberOrIDConverter(commands.Converter):
    async def convert(self, ctx: commands.Context, argument: str) -> discord.Member | discord.User:
        if isinstance(argument, (discord.Member, discord.User)):
            return argument
        arg_str = str(argument).strip()
        try:
            return await commands.MemberConverter().convert(ctx, arg_str)
        except commands.BadArgument:
            pass

        try:
            return await commands.UserConverter().convert(ctx, arg_str)
        except commands.BadArgument:
            pass

        cleaned = arg_str.strip("<@!>")
        if cleaned.isdigit():
            try:
                user = await ctx.bot.fetch_user(int(cleaned))
                if user:
                    if ctx.guild:
                        member = ctx.guild.get_member(user.id)
                        if member:
                            return member
                    return user
            except Exception:
                pass

        raise commands.BadArgument(f"Could not find member or user '{argument}'. Please provide a valid @mention or user ID.")

class UserOrIDConverter(commands.Converter):
    async def convert(self, ctx: commands.Context, argument: str) -> discord.User:
        if isinstance(argument, discord.User):
            return argument
        arg_str = str(argument).strip()
        try:
            return await commands.UserConverter().convert(ctx, arg_str)
        except commands.BadArgument:
            pass

        cleaned = arg_str.strip("<@!>")
        if cleaned.isdigit():
            try:
                user = await ctx.bot.fetch_user(int(cleaned))
                if user:
                    return user
            except Exception:
                pass

        raise commands.BadArgument(f"Could not find user '{argument}'. Please provide a valid @mention or user ID.")

async def send_moderation_dm(user: discord.Member | discord.User, guild_name: str, action: str, reason: str, duration: str = None, guild_id: int = None):
    try:
        desc = f"You were {action} in {guild_name}{f' for {duration}' if duration else ''}. | {reason}"
        
        if guild_id:
            from Components.Systems.BanAppeals._storage import load_appeals_config
            appeals_cfg = load_appeals_config(guild_id)
            if appeals_cfg.get("enabled"):
                allowed = appeals_cfg.get("allowed_punishments", [])
                p_map = {"banned": "ban", "voice banned": "ban", "timed out": "timeout", "muted": "timeout", "voice muted": "timeout", "kicked": "kick", "warned": "warn"}
                if p_map.get(action) in allowed:
                    custom_url = appeals_cfg.get("custom_url", "orbit")
                    import urllib.parse
                    encoded_url = urllib.parse.quote(custom_url)
                    base_url = os.environ.get("BASE_URL")
                    desc += f"\n\n**Appeals:** You can appeal this punishment at: {base_url}/appeal/{encoded_url}"

        embed = discord.Embed(
            description=desc,
            color=discord.Color.red()
        )
        await user.send(embed=embed)
    except Exception:
        pass

def is_immune(guild_id: int, target: discord.User | discord.Member) -> bool:
    from Components.Systems.WebDashboard._storage import load_settings_config
    settings_cfg = load_settings_config(guild_id)
    
    immune_users = settings_cfg.get("immune_users", [])
    if str(target.id) in immune_users:
        return True
        
    if isinstance(target, discord.Member):
        immune_roles = settings_cfg.get("immune_roles", [])
        for role in target.roles:
            if str(role.id) in immune_roles:
                return True
                
    return False

def build_embed(guild: discord.Guild | None, title: str = None, description: str = None, color: discord.Color = ORBIT_COLOR, **kwargs) -> discord.Embed:
    from Components.Database.mongodb import get_config
    settings = get_config("Settings", guild.id) if guild else {}
    style = settings.get("embed_style", "normal")
    
    if style == "v2":
        embed = discord.Embed(description=description, color=color, **kwargs)
        if title:
            embed.set_author(name=title, icon_url=guild.icon.url if guild and guild.icon else None)
        if guild:
            embed.set_footer(text=f"{guild.name} • Orbit")
        return embed
    else:
        embed = discord.Embed(title=title, description=description, color=color, **kwargs)
        return embed
