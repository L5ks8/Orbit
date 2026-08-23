import discord
from discord.ext import commands

from Components.Commands.Verify._storage import load_verify_config
from Components.Commands.Verify.verify import verify_group

async def _do_verify_status(ctx: commands.Context):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send(embed=make_embed("This command must be run inside a server.", discord.Color.red()), ephemeral=True)

    config = load_verify_config(ctx.guild.id)
    enabled = config.get("enabled", True)
    ch_id = config.get("channel_id")
    role_id = config.get("role_id")
    remove_role_id = config.get("remove_role_id")
    auto_kick = config.get("auto_kick_minutes", 0)

    ch_display = f"<#{ch_id}> (`{ch_id}`)" if ch_id else "`Not set`"
    role_display = f"<@&{role_id}> (`{role_id}`)" if role_id else "`Not set`"
    rem_display = f"<@&{remove_role_id}> (`{remove_role_id}`)" if remove_role_id else "`Not set`"
    kick_str = f"`{auto_kick} minutes`" if auto_kick > 0 else "`Disabled`"

    active = bool(enabled and ch_id and role_id)
    embed = discord.Embed(title=f"Server Verification Status: {ctx.guild.name}", color=discord.Color.blue() if active else discord.Color.red())
    embed.add_field(name="Status", value="Active" if active else "Inactive", inline=False)
    embed.add_field(name="System Enabled", value='Yes' if enabled else 'No', inline=True)
    embed.add_field(name="Channel", value=ch_display, inline=True)
    embed.add_field(name="Granted Role", value=role_display, inline=True)
    embed.add_field(name="Removed Role", value=rem_display, inline=True)
    embed.add_field(name="Auto-Kick Timer", value=kick_str, inline=True)
    embed.add_field(name="Pending Unverified", value=f"`{len(config.get('pending_kicks', {}))}`", inline=True)
    
    await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())

@verify_group.command(name="status", description="Check CAPTCHA verification configuration status.")
@commands.has_permissions(manage_guild=True)
async def status_cmd(ctx: commands.Context):
    await _do_verify_status(ctx)

class VerifyStatusCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @status_cmd.error
    async def status_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send(embed=make_embed("You need Manage Server permission to check verification status.", discord.Color.red()), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

class VerifyStatusFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="vf_status", aliases=["verifystatus"], hidden=True)
    @commands.has_permissions(manage_guild=True)
    async def status_prefix(self, ctx: commands.Context):
        await _do_verify_status(ctx)

async def setup(bot: commands.Bot):
    from Components.Commands.Verify.verify import verify_group
    from Components.Commands._utils import make_embed
    if "verification" not in bot.all_commands:
        bot.add_command(verify_group)
    await bot.add_cog(VerifyStatusCog(bot))
    await bot.add_cog(VerifyStatusFallback(bot))
