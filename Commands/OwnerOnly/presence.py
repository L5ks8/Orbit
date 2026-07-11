import discord
from discord.ext import commands
from Commands.OwnerOnly.status import _save_status, _load_status, _parse_discord_status, _build_activity, StatusInteractiveLayout

class PresenceCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="presence", aliases=["setstatus", "botstatus"], description="Owner Only: Sets Orbit's Discord presence status (`online`, `idle`, `dnd`, `invisible`).")
    @commands.is_owner()
    async def presence_cmd(self, ctx: commands.Context, status_arg: str = None):
        data = _load_status() or {}
        curr_type = data.get("type", "clear")
        curr_text = data.get("text", "")

        if not status_arg:
            curr_status_str = data.get("status", "online")
            view = StatusInteractiveLayout(self.bot, curr_type, curr_text, curr_status_str)
            return await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

        t_clean = status_arg.lower().strip()
        valid_status_map = {
            "online": "online",
            "on": "online",
            "idle": "idle",
            "abwesend": "idle",
            "afk": "idle",
            "dnd": "dnd",
            "do_not_disturb": "dnd",
            "nicht stören": "dnd",
            "nicht stoeren": "dnd",
            "disturb": "dnd",
            "invisible": "invisible",
            "offline": "invisible",
            "off": "invisible",
            "unsichtbar": "invisible"
        }

        if t_clean not in valid_status_map:
            return await ctx.send("Invalid presence status! Please specify: `online`, `idle` (`abwesend`), `dnd` (`nicht stoeren`), or `invisible` (`offline`).", allowed_mentions=discord.AllowedMentions.none())

        target_status_str = valid_status_map[t_clean]
        discord_status = _parse_discord_status(target_status_str)
        act = _build_activity(curr_type, curr_text)

        await self.bot.change_presence(activity=act, status=discord_status)
        _save_status(curr_type, curr_text, target_status_str)

        view = StatusInteractiveLayout(self.bot, curr_type, curr_text, target_status_str)
        await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

    @presence_cmd.error
    async def presence_error(self, ctx: commands.Context, error):
        if not isinstance(error, commands.NotOwner):
            await ctx.send(f"Presence error: {error}", allowed_mentions=discord.AllowedMentions.none())


async def setup(bot: commands.Bot):
    await bot.add_cog(PresenceCommand(bot))
