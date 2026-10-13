import discord
from discord import app_commands
from discord.ext import commands
import re
from Components.Commands.Cases._storage import create_case
from Components.Commands.ModLog._modlog_storage import add_modlog
from Components.Commands._utils import make_embed, make_v2_card, ORBIT_COLOR, InteractionContext
from Components.emojis import Emojis

class MassBanCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @app_commands.command(name="massban", description="Bans multiple users from the server at once.")
    @app_commands.describe(
        users="The users to ban, separated by spaces (IDs or mentions)",
        reason="The reason for the mass ban",
        history="Delete message history for the banned users"
    )
    @app_commands.choices(history=[
        app_commands.Choice(name="Don't delete", value=0),
        app_commands.Choice(name="1 Hour", value=3600),
        app_commands.Choice(name="6 Hours", value=21600),
        app_commands.Choice(name="12 Hours", value=43200),
        app_commands.Choice(name="24 Hours", value=86400),
        app_commands.Choice(name="3 Days", value=259200),
        app_commands.Choice(name="7 Days", value=604800)
    ])
    @app_commands.default_permissions(ban_members=True)
    @app_commands.checks.has_permissions(ban_members=True)
    @app_commands.checks.bot_has_permissions(ban_members=True)
    async def massban_cmd(self, interaction: discord.Interaction, users: str, reason: str = "No reason provided", history: int = 0):
        ctx = InteractionContext(interaction)
        await ctx.defer()
        
        user_ids_raw = re.findall(r'\d+', users)
        if not user_ids_raw:
            return await ctx.send(embed=make_embed("No valid user IDs or mentions found in the input."), ephemeral=True)
            
        seen = set()
        user_ids = [int(uid) for uid in user_ids_raw if not (uid in seen or seen.add(uid))]
        
        if len(user_ids) > 50:
            return await ctx.send(embed=make_embed("You can only mass ban up to 50 users at a time to prevent rate limits."), ephemeral=True)
            
        success_count = 0
        failed_count = 0
        
        for uid in user_ids:
            if uid == ctx.author.id:
                failed_count += 1
                continue
                
            try:
                await ctx.guild.ban(
                    discord.Object(id=uid),
                    reason=f"Massban by {ctx.author} | Reason: {reason}",
                    delete_message_seconds=history
                )
                success_count += 1
                
                create_case(ctx.guild.id, uid, ctx.author.id, "ban", reason)
                add_modlog(ctx.guild.id, uid, ctx.author.id, "Ban (Mass)", reason)
                
            except discord.Forbidden:
                failed_count += 1
            except discord.HTTPException:
                failed_count += 1
                
        card_color = ORBIT_COLOR if success_count > 0 else discord.Color.red()
        content = f"# Mass Ban Complete\n\nSuccessfully banned **{success_count}** user(s).\nFailed to ban **{failed_count}** user(s)."
        card = make_v2_card(content, color=card_color)
        if card:
            await ctx.send(view=card)
        else:
            embed = discord.Embed(
                title="Mass Ban Complete",
                description=f"Successfully banned **{success_count}** user(s).\nFailed to ban **{failed_count}** user(s).",
                color=card_color
            )
            await ctx.send(embed=embed)

    @massban_cmd.error
    async def massban_error(self, interaction: discord.Interaction, error):
        ctx = InteractionContext(interaction)
        if isinstance(error, (app_commands.MissingPermissions, commands.MissingPermissions)):
            await ctx.send(embed=make_embed("You need `Ban Members` permission to use this command.", discord.Color.red()), ephemeral=True)
        elif isinstance(error, (app_commands.BotMissingPermissions, commands.BotMissingPermissions)):
            await ctx.send(embed=make_embed("I need `Ban Members` permission to execute this command."), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(MassBanCog(bot))
