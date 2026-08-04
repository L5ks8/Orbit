import discord
from discord.ext import commands
from discord import app_commands
from Commands.Cases._storage import get_case, delete_case, update_case_reason

@commands.hybrid_group(name="case", description="Manage moderation cases.")
@commands.has_permissions(manage_messages=True)
async def case_group(ctx: commands.Context):
    if ctx.invoked_subcommand is None:
        await ctx.send("Please specify a subcommand: info, delete, or reason.", ephemeral=True)

class CaseCommandsCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @case_group.command(name="info", description="Zeigt Informationen zu einem Fall an.")
    @app_commands.describe(fall="Die ID des Falls (Zahl)")
    async def case_info(self, ctx: commands.Context, fall: int):
        case_data = get_case(ctx.guild.id, fall)
        if not case_data:
            return await ctx.send(f"Case #{fall} not found in this server.", ephemeral=True)
            
        action = case_data.get("action", "Unknown").capitalize()
        reason = case_data.get("reason", "No reason provided")
        user_id = case_data.get("user_id", "Unknown")
        mod_id = case_data.get("moderator_id", "Unknown")
        timestamp = case_data.get("timestamp", 0)
        
        embed = discord.Embed(
            title=f"Case #{fall} | {action}",
            color=discord.Color.blue()
        )
        embed.add_field(name="User", value=f"<@{user_id}> (`{user_id}`)", inline=False)
        embed.add_field(name="Moderator", value=f"<@{mod_id}> (`{mod_id}`)", inline=False)
        embed.add_field(name="Reason", value=reason, inline=False)
        embed.add_field(name="Date", value=f"<t:{timestamp}:F> (<t:{timestamp}:R>)", inline=False)
        
        await ctx.send(embed=embed)

    @case_group.command(name="delete", description="Löscht einen Fall.")
    @app_commands.describe(fall="Die ID des Falls (Zahl)")
    async def case_delete(self, ctx: commands.Context, fall: int):
        success = delete_case(ctx.guild.id, fall)
        if success:
            await ctx.send(f"Case #{fall} has been successfully deleted.", ephemeral=True)
        else:
            await ctx.send(f"Case #{fall} could not be found or deleted.", ephemeral=True)

    @case_group.command(name="reason", description="Ändert den Grund eines Falls.")
    @app_commands.describe(fall="Die ID des Falls (Zahl)", grund="Der neue Grund")
    async def case_reason(self, ctx: commands.Context, fall: int, *, grund: str):
        success = update_case_reason(ctx.guild.id, fall, grund)
        if success:
            await ctx.send(f"Reason for Case #{fall} has been updated to: **{grund}**", ephemeral=True)
        else:
            await ctx.send(f"Case #{fall} could not be found.", ephemeral=True)

async def setup(bot: commands.Bot):
    bot.add_command(case_group)
    await bot.add_cog(CaseCommandsCog(bot))
