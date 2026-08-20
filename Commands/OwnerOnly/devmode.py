import discord
from discord.ext import commands
from Commands.OwnerOnly._storage import load_devmode_config, save_devmode_config
from Commands._utils import make_embed

class DevmodeCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    def _get_embed(self, enabled: bool, reason: str, owner: discord.abc.User):
        status_text = "**ACTIVE (`Developer Mode ON`)**" if enabled else "**DISABLED (`Normal Operations`)**"
        title_text = "Orbit Developer Mode Activated" if enabled else "Orbit Developer Mode Deactivated"
        
        embed = discord.Embed(
            title=title_text,
            description=(
                f"**Devmode Status:** {status_text}\n"
                f"**Lockdown Reason:** `{reason}`\n"
                f"**Authorized By:** {owner.mention}\n\n"
                f"*-# While Developer Mode is ACTIVE, regular users are restricted across all servers while the bot owner retains 100% full access.*"
            ),
            color=0x2B2D31
        )
        return embed

    @commands.command(name="devmode", hidden=True)
    @commands.is_owner()
    async def devmode_cmd(self, ctx: commands.Context, state: str = None, *, reason: str = "System upgrades and developer testing"):
        config = load_devmode_config()
        if state is None:
            embed = self._get_embed(config.get("enabled", False), config.get("reason", "System upgrades and developer testing"), ctx.author)
            return await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())

        clean_state = state.lower().strip()
        if clean_state in ["true", "on", "1", "enable", "yes"]:
            enabled = True
        elif clean_state in ["false", "off", "0", "disable", "no"]:
            enabled = False
        else:
            return await ctx.send(embed=make_embed("Usage: `-devmode <true/false> [reason]` (`-devmode true Database upgrades in progress`)", discord.Color.red()), allowed_mentions=discord.AllowedMentions.none())

        config["enabled"] = enabled
        if reason and reason.strip():
            config["reason"] = reason.strip()

        save_devmode_config(config)
        embed = self._get_embed(enabled, config["reason"], ctx.author)
        await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())

    @devmode_cmd.error
    async def devmode_error(self, ctx: commands.Context, error):
        if not isinstance(error, commands.NotOwner):
            await ctx.send(embed=make_embed(f"Devmode Error: {error}", discord.Color.red()), allowed_mentions=discord.AllowedMentions.none())

async def setup(bot: commands.Bot):
    await bot.add_cog(DevmodeCommand(bot))