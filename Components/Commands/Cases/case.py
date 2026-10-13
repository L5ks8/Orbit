import discord
from discord.ext import commands
from discord import app_commands
from Components.Commands.Cases._storage import get_case, delete_case, update_case_reason
from Components.Commands._utils import make_embed, make_v2_card, ORBIT_COLOR, InteractionContext
from Components.emojis import Emojis

case_group = app_commands.Group(name="case", description="Manage moderation cases.", default_permissions=discord.Permissions(manage_messages=True))

@case_group.command(name="info", description="Zeigt Informationen zu einem Fall an.")
@app_commands.describe(fall="Die ID des Falls (Zahl)")
@app_commands.checks.has_permissions(manage_messages=True)
async def case_info(interaction: discord.Interaction, fall: int):
    ctx = InteractionContext(interaction)
    case_data = get_case(ctx.guild.id, fall)
    if not case_data:
        return await ctx.send(embed=make_embed(f"Case #{fall} not found in this server.", discord.Color.red()), ephemeral=True)
        
    action = case_data.get("action", "Unknown").capitalize()
    reason = case_data.get("reason", "No reason provided")
    user_id = case_data.get("user_id", "Unknown")
    mod_id = case_data.get("moderator_id", "Unknown")
    timestamp = case_data.get("timestamp", 0)
    
    content = (
        f"# Case #{fall} | {action}\n\n"
        f"**User:** <@{user_id}> (`{user_id}`)\n"
        f"**Moderator:** <@{mod_id}> (`{mod_id}`)\n"
        f"**Reason:** {reason}\n"
        f"**Date:** <t:{timestamp}:F> (<t:{timestamp}:R>)"
    )
    card = make_v2_card(content, color=ORBIT_COLOR)
    if card:
        return await ctx.send(view=card)

    embed = discord.Embed(
        title=f"Case #{fall} | {action}",
        color=ORBIT_COLOR
    )
    embed.add_field(name="User", value=f"<@{user_id}> (`{user_id}`)", inline=False)
    embed.add_field(name="Moderator", value=f"<@{mod_id}> (`{mod_id}`)", inline=False)
    embed.add_field(name="Reason", value=reason, inline=False)
    embed.add_field(name="Date", value=f"<t:{timestamp}:F> (<t:{timestamp}:R>)", inline=False)
    
    await ctx.send(embed=embed)

@case_group.command(name="delete", description="Löscht einen Fall.")
@app_commands.describe(fall="Die ID des Falls (Zahl)")
@app_commands.checks.has_permissions(manage_messages=True)
async def case_delete(interaction: discord.Interaction, fall: int):
    ctx = InteractionContext(interaction)
    success = delete_case(ctx.guild.id, fall)
    if success:
        card = make_v2_card(f"# Case Deleted\n\nCase #{fall} has been successfully deleted.", color=ORBIT_COLOR)
        if card:
            return await ctx.send(view=card, ephemeral=True)
        await ctx.send(embed=make_embed(f"Case #{fall} has been successfully deleted.", ORBIT_COLOR), ephemeral=True)
    else:
        await ctx.send(embed=make_embed(f"Case #{fall} could not be found or deleted.", discord.Color.red()), ephemeral=True)

@case_group.command(name="reason", description="Ändert den Grund eines Falls.")
@app_commands.describe(fall="Die ID des Falls (Zahl)", grund="Der neue Grund")
@app_commands.checks.has_permissions(manage_messages=True)
async def case_reason(interaction: discord.Interaction, fall: int, *, grund: str):
    ctx = InteractionContext(interaction)
    success = update_case_reason(ctx.guild.id, fall, grund)
    if success:
        card = make_v2_card(f"# Case Reason Updated\n\nReason for Case #{fall} has been updated to: **{grund}**", color=ORBIT_COLOR)
        if card:
            return await ctx.send(view=card, ephemeral=True)
        await ctx.send(embed=make_embed(f"Reason for Case #{fall} has been updated to: **{grund}**", ORBIT_COLOR), ephemeral=True)
    else:
        await ctx.send(embed=make_embed(f"Case #{fall} could not be found.", discord.Color.red()), ephemeral=True)

async def setup(bot: commands.Bot):
    bot.tree.add_command(case_group)
