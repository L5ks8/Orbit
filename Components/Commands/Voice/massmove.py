import discord
from discord import app_commands
from discord.ext import commands
from Components.Commands._utils import make_embed

class MassMoveCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="massmove", description="Moves all members from one voice channel to another.")
    @app_commands.describe(
        from_channel="The voice channel to move members from",
        to_channel="The voice channel to move members to"
    )
    @commands.has_permissions(move_members=True)
    @commands.bot_has_permissions(move_members=True)
    async def massmove_cmd(self, ctx: commands.Context, from_channel: discord.VoiceChannel, to_channel: discord.VoiceChannel):
        await ctx.defer()
        
        if from_channel.id == to_channel.id:
            return await ctx.send(embed=make_embed("You cannot move members to the same channel.", discord.Color.red()), ephemeral=True)
            
        members = from_channel.members
        if not members:
            return await ctx.send(embed=make_embed(f"There are no members in {from_channel.mention} to move."), ephemeral=True)
            
        success_count = 0
        failed_count = 0
        
        for member in members:
            try:
                await member.move_to(to_channel)
                success_count += 1
            except discord.Forbidden:
                failed_count += 1
            except discord.HTTPException:
                failed_count += 1
                
        embed = discord.Embed(
            title="Mass Move Complete",
            description=f"Successfully moved **{success_count}** member(s) from {from_channel.mention} to {to_channel.mention}.",
            color=discord.Color.green()
        )
        if failed_count > 0:
            embed.description += f"\nFailed to move **{failed_count}** member(s)."
            
        await ctx.send(embed=embed)

    @massmove_cmd.error
    async def massmove_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send(embed=make_embed("You need `Move Members` permission to use this command.", discord.Color.red()), ephemeral=True)
        elif isinstance(error, commands.BotMissingPermissions):
            await ctx.send(embed=make_embed("I need `Move Members` permission to execute this command."), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(MassMoveCog(bot))