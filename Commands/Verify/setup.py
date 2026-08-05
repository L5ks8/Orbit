import discord
from discord import app_commands
from discord.ext import commands

from Commands.Verify._storage import setup_verify_config
from Commands.Verify._views import PersistentVerifyLayout
from Commands.Verify.verify import verify_group

async def _do_verify_setup(
    ctx: commands.Context,
    channel: discord.TextChannel,
    role: discord.Role,
    remove_role: discord.Role | None,
    auto_kick_minutes: int
):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)

    remove_role_id = remove_role.id if remove_role else None
    config = setup_verify_config(ctx.guild.id, channel.id, role.id, remove_role_id, auto_kick_minutes)
    
    emb_title = config.get("embed_title") if config.get("embed_title") is not None else ""
    emb_desc = config.get("embed_description") if config.get("embed_description") is not None else "This server requires you to verify yourself to get access to other channels, you can simply verify by clicking on the verify button."
    
    try:
        emb_color = discord.Color(int(config.get("embed_color", "").lstrip('#'), 16)) if config.get("embed_color") else discord.Color.blue()
    except:
        emb_color = discord.Color.blue()

    embed = discord.Embed(
        title=emb_title,
        description=emb_desc,
        color=emb_color
    )
    
    emb_image = config.get("embed_image", "") or "https://raw.githubusercontent.com/L5ks8/Orbit/main/Web/static/default_verify.png"
    if emb_image:
        embed.set_image(url=emb_image)
    btn_verify = discord.ui.Button(label="Verify Now", style=discord.ButtonStyle.success, custom_id="orbit:verify_start")
    view = discord.ui.View(timeout=None)
    view.add_item(btn_verify)
    
    panel_kwargs = {"embed": embed, "view": view}
    try:
        await channel.send(**panel_kwargs, allowed_mentions=discord.AllowedMentions.none())
    except Exception as e:
        return await ctx.send(f"Could not post verification card inside {channel.mention}: {e}", ephemeral=True)

    kick_str = f"`{auto_kick_minutes} minutes`" if auto_kick_minutes > 0 else "`Disabled (No auto-kick)`"
    rem_str = remove_role.mention if remove_role else "`None (Disabled)`"
    
    success_embed = discord.Embed(title=f"Verification Configured: {ctx.guild.name}", color=discord.Color.green())
    success_embed.add_field(name="Verification Channel", value=channel.mention, inline=False)
    success_embed.add_field(name="Granted Role", value=role.mention, inline=False)
    success_embed.add_field(name="Removed Role", value=rem_str, inline=False)
    success_embed.add_field(name="Auto-Kick Timer", value=kick_str, inline=False)
    success_embed.set_footer(text="The interactive verification panel is now live.")
    
    success_kwargs = {"embed": success_embed}
    
    await ctx.send(**success_kwargs, allowed_mentions=discord.AllowedMentions.none())

@verify_group.command(name="setup", description="Configure the CAPTCHA verification channel and roles.")
@commands.has_permissions(manage_guild=True)
@app_commands.describe(
    channel="The channel where the verification card will be posted",
    role="The role granted after solving the CAPTCHA",
    remove_role="Optional: Role removed after verifying (e.g. Unverified/Quarantine role)",
    auto_kick_minutes="Optional: Minutes before unverified joining members get kicked (`0 = Disabled`)"
)
async def setup_cmd(ctx: commands.Context, channel: discord.TextChannel, role: discord.Role, remove_role: discord.Role = None, auto_kick_minutes: int = 0):
    await _do_verify_setup(ctx, channel, role, remove_role, auto_kick_minutes)

class VerifySetupCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @setup_cmd.error
    async def setup_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need Manage Server permission to configure verification.", ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send("Usage: `-verify setup <#channel> <@role> [remove_role] [auto_kick_minutes]`", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

class VerifySetupFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="vf_setup", aliases=["verifysetup"], hidden=True)
    @commands.has_permissions(manage_guild=True)
    async def setup_prefix(self, ctx: commands.Context, channel: discord.TextChannel, role: discord.Role, remove_role: discord.Role = None, auto_kick_minutes: int = 0):
        await _do_verify_setup(ctx, channel, role, remove_role, auto_kick_minutes)

async def setup(bot: commands.Bot):
    from Commands.Verify.verify import verify_group
    if "verify" not in bot.all_commands:
        bot.add_command(verify_group)
    bot.add_view(PersistentVerifyLayout())
    await bot.add_cog(VerifySetupCog(bot))
    await bot.add_cog(VerifySetupFallback(bot))

