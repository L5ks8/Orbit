import discord
from discord.ext import commands
from discord import app_commands
from Components.Commands._utils import make_embed

class BotsListCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="bots", description="Get a list of all bots in a specific server.")
    @app_commands.describe(server_id="The ID of the server to get bots from")
    async def bots_cmd(self, ctx: commands.Context, server_id: str):
        await ctx.defer(ephemeral=True)
        
        try:
            guild_id = int(server_id)
        except ValueError:
            return await ctx.send(embed=make_embed("Invalid server ID provided.", discord.Color.red()), ephemeral=True)
            
        guild = self.bot.get_guild(guild_id)
        if not guild:
            return await ctx.send(embed=make_embed("I am not in a server with that ID.", discord.Color.red()), ephemeral=True)
            
        bots = [member.mention for member in guild.members if member.bot]
        
        if not bots:
            return await ctx.send(embed=make_embed(f"No bots found in {guild.name}.", discord.Color.red()), ephemeral=True)
            
        bots_str = " ".join(bots)
        
        if len(bots_str) > 4000:
            bots_str = bots_str[:3990] + "..."
            
        embed = discord.Embed(
            title=f"Bots in {guild.name}",
            description=bots_str,
            color=0x3B82F6
        )
        await ctx.send(embed=embed, ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(BotsListCommand(bot))
