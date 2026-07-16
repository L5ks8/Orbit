import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button
from Database.storagehandler import load_devmode_config, save_devmode_config

class DevmodeStatusLayout(LayoutView):
    def __init__(self, enabled: bool, reason: str, owner: discord.abc.User):
        super().__init__()
        status_text = "**ACTIVE (`Developer Mode ON`)**" if enabled else "**DISABLED (`Normal Operations`)**"
        color_badge = "### Orbit Developer Mode Activated" if enabled else "### Orbit Developer Mode Deactivated"
        
        self.container = Container(
            TextDisplay(content=color_badge),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(
                content=(
                    f"**Devmode Status:** {status_text}\n"
                    f"**Lockdown Reason:** `{reason}`\n"
                    f"**Authorized By:** {owner.mention}\n\n"
                    f"*-# While Developer Mode is ACTIVE, regular users are restricted across all servers while the bot owner retains 100% full access.*"
                )
            )
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


class DevmodeCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="devmode", hidden=True)
    @commands.is_owner()
    async def devmode_cmd(self, ctx: commands.Context, state: str = None, *, reason: str = "System upgrades and developer testing"):
        config = await load_devmode_config()
        if state is None:
            view = DevmodeStatusLayout(config.get("enabled", False), config.get("reason", "System upgrades and developer testing"), ctx.author)
            return await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

        clean_state = state.lower().strip()
        if clean_state in ["true", "on", "1", "enable", "yes"]:
            enabled = True
        elif clean_state in ["false", "off", "0", "disable", "no"]:
            enabled = False
        else:
            return await ctx.send("Usage: `-devmode <true/false> [reason]` (`-devmode true Database upgrades in progress`)", allowed_mentions=discord.AllowedMentions.none())

        config["enabled"] = enabled
        if reason and reason.strip():
            config["reason"] = reason.strip()

        await save_devmode_config(config)
        view = DevmodeStatusLayout(enabled, config["reason"], ctx.author)
        await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

    @devmode_cmd.error
    async def devmode_error(self, ctx: commands.Context, error):
        if not isinstance(error, commands.NotOwner):
            await ctx.send(f"Devmode Error: {error}", allowed_mentions=discord.AllowedMentions.none())


async def setup(bot: commands.Bot):
    await bot.add_cog(DevmodeCommand(bot))
