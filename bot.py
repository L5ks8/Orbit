import sys
sys.dont_write_bytecode = True

import os
import asyncio
import pathlib
import discord
from discord.ext import commands

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    if os.path.exists(".env"):
        with open(".env", "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, value = line.split("=", 1)
                    os.environ[key.strip()] = value.strip()

TOKEN = os.getenv("TOKEN", "")
PREFIX = os.getenv("PREFIX", "-").replace("=", "").strip()
if not PREFIX:
    PREFIX = "-"

intents = discord.Intents.default()
intents.message_content = True
intents.members = True

class DevmodeNoticeLayout(discord.ui.LayoutView):
    def __init__(self, reason: str):
        super().__init__()
        self.container = discord.ui.Container(
            discord.ui.TextDisplay(content="### Orbit Developer Mode Active"),
            discord.ui.Separator(spacing=discord.SeparatorSpacing.small),
            discord.ui.TextDisplay(content=f"**Status:** Developer Mode Activated (`Restricted Access`)\n**Reason:** {reason}\n\n*-# All regular bot interactions are temporarily paused while our developer deploys updates or performs maintenance. Please check back shortly!*")
        )
        self.add_item(self.container)

class OrbitCommandTree(discord.app_commands.CommandTree):
    async def interaction_check(self, interaction: discord.Interaction) -> bool:
        if interaction.guild:
            from Commands.Blacklist._storage import is_blacklisted
            if is_blacklisted(interaction.guild.id, interaction.user.id):
                try:
                    if interaction.response.is_done():
                        await interaction.followup.send("You are blacklisted from using bot commands on this server.", ephemeral=True)
                    else:
                        await interaction.response.send_message("You are blacklisted from using bot commands on this server.", ephemeral=True)
                except Exception:
                    pass
                return False

        from Commands.OwnerOnly._storage import is_devmode_enabled
        enabled, reason = is_devmode_enabled()
        if not enabled:
            return True
        if await interaction.client.is_owner(interaction.user):
            return True
        view = DevmodeNoticeLayout(reason)
        try:
            if interaction.response.is_done():
                await interaction.followup.send(view=view, ephemeral=True, allowed_mentions=discord.AllowedMentions.none())
            else:
                await interaction.response.send_message(view=view, ephemeral=True, allowed_mentions=discord.AllowedMentions.none())
        except Exception:
            pass
        return False

    async def on_error(self, interaction: discord.Interaction, error: discord.app_commands.AppCommandError):
        try:
            from Commands.OwnerOnly._monitor import record_error
            cmd_name = interaction.command.name if interaction.command else "Component/Modal"
            record_error(f"AppCommand/UI Error [{cmd_name}]", getattr(error, "original", error))
        except Exception:
            pass
        try:
            if not interaction.response.is_done():
                await interaction.response.send_message(f"An error occurred: `{error}`", ephemeral=True)
        except Exception:
            pass

class OrbitBot(commands.Bot):
    def __init__(self):
        super().__init__(
            command_prefix=commands.when_mentioned_or(PREFIX),
            intents=intents,
            help_command=None,
            tree_cls=OrbitCommandTree
        )

    async def setup_hook(self):
        commands_dir = pathlib.Path("Commands")
        if not commands_dir.exists():
            commands_dir.mkdir(parents=True, exist_ok=True)

        # Load root command group modules first (e.g. Commands/Role/role.py, Commands/Ticket/ticket.py)
        for file_path in commands_dir.rglob("*.py"):
            if file_path.name.startswith("_"):
                continue
            if file_path.stem.lower() == file_path.parent.name.lower():
                extension = ".".join(file_path.with_suffix("").parts)
                try:
                    await self.load_extension(extension)
                    print(f"Loaded Root Group: {extension}")
                except Exception as e:
                    print(f"Failed to load root group {extension}: {e}")

        # Load subcommands and remaining modules
        for file_path in commands_dir.rglob("*.py"):
            if file_path.name.startswith("_"):
                continue
            if file_path.stem.lower() == file_path.parent.name.lower():
                continue
            extension = ".".join(file_path.with_suffix("").parts)
            try:
                await self.load_extension(extension)
                print(f"Loaded: {extension}")
            except Exception as e:
                print(f"Failed to load {extension}: {e}")

        try:
            synced = await self.tree.sync()
            total_cmds = 0
            for cmd in synced:
                if hasattr(cmd, 'commands'):
                    total_cmds += len(cmd.commands) + 1
                else:
                    total_cmds += 1
            print(f"Synced {len(synced)} top-level command group(s) ({total_cmds} total subcommands & commands across all modules)")
        except Exception as e:
            print(f"Failed to sync commands: {e}")

        _old_view_error = discord.ui.View.on_error
        async def _global_view_error(view_self, error, item, interaction: discord.Interaction):
            try:
                from Commands.OwnerOnly._monitor import record_error
                record_error(f"UI View Error [{view_self.__class__.__name__} -> {item.__class__.__name__}]", error)
            except Exception:
                pass
            await _old_view_error(view_self, error, item, interaction)
        discord.ui.View.on_error = _global_view_error

        _old_modal_error = discord.ui.Modal.on_error
        async def _global_modal_error(modal_self, error, interaction: discord.Interaction):
            try:
                from Commands.OwnerOnly._monitor import record_error
                record_error(f"UI Modal Error [{modal_self.__class__.__name__}]", error)
            except Exception:
                pass
            await _old_modal_error(modal_self, error, interaction)
        discord.ui.Modal.on_error = _global_modal_error

        if os.environ.get("RENDER") or os.environ.get("PORT"):
            try:
                from aiohttp import web
                async def _health_handler(request):
                    return web.Response(text="Orbit Discord Bot is Online & Healthy!")
                app = web.Application()
                app.router.add_get("/", _health_handler)
                runner = web.AppRunner(app)
                await runner.setup()
                port = int(os.environ.get("PORT", 10000))
                site = web.TCPSite(runner, "0.0.0.0", port)
                await site.start()
                print(f"Render Web Service bound to 0.0.0.0:{port}")
            except Exception as e:
                print(f"Failed to bind Render port: {e}")

    async def on_error(self, event_method: str, *args, **kwargs):
        try:
            from Commands.OwnerOnly._monitor import record_error
            import sys
            exc_type, exc_value, exc_tb = sys.exc_info()
            if exc_value:
                record_error(f"Event Error [{event_method}]", exc_value)
        except Exception:
            pass
        await super().on_error(event_method, *args, **kwargs)

    async def on_ready(self):
        print(f"Logged in as {self.user} (ID: {self.user.id})")
        print(f"Prefix: '{PREFIX}'")
        print(f"Loaded cogs: {len(self.cogs)}")

    async def on_message(self, message: discord.Message):
        if not message.author.bot:
            try:
                from Commands.OwnerOnly._monitor import record_message
                record_message()
            except Exception:
                pass
        await super().on_message(message)

    async def on_command_error(self, ctx: commands.Context, error: commands.CommandError):
        if isinstance(error, (commands.CommandNotFound, commands.CheckFailure)):
            return
        if hasattr(error, "original") and isinstance(error.original, discord.app_commands.errors.CommandSignatureMismatch):
            try:
                await ctx.send("Command definitions have just been updated! Please try running the command again.", ephemeral=True)
            except Exception:
                pass
            return
        try:
            from Commands.OwnerOnly._monitor import record_error
            record_error("Command Error", getattr(error, "original", error))
        except Exception:
            pass
        raise error

bot = OrbitBot()

@bot.check
async def global_blacklist_prefix_check(ctx: commands.Context):
    if not ctx.guild:
        return True
    from Commands.Blacklist._storage import is_blacklisted
    if is_blacklisted(ctx.guild.id, ctx.author.id):
        try:
            await ctx.send("You are blacklisted from using bot commands on this server.", delete_after=5.0)
        except Exception:
            pass
        return False
    return True

@bot.check
async def global_devmode_prefix_check(ctx: commands.Context):
    from Commands.OwnerOnly._storage import is_devmode_enabled
    enabled, reason = is_devmode_enabled()
    if not enabled:
        return True
    if await ctx.bot.is_owner(ctx.author):
        return True
    view = DevmodeNoticeLayout(reason)
    try:
        await ctx.send(view=view, delete_after=15.0, allowed_mentions=discord.AllowedMentions.none())
    except Exception:
        pass
    return False

if __name__ == "__main__":
    if not TOKEN:
        print("Error: No TOKEN found in .env file.")
    else:
        bot.run(TOKEN)
