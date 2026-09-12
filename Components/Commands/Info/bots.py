import discord
from discord.ext import commands
from discord import app_commands
from Components.Commands._utils import make_embed

class BotsListCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="bots", description="Get a list of all bots in the server.")
    @app_commands.allowed_installs(guilds=True, users=True)
    @app_commands.allowed_contexts(guilds=True, dms=False, private_channels=False)
    async def bots_cmd(self, ctx: commands.Context):
        await ctx.defer(ephemeral=True)
        
        guild_id = ctx.interaction.guild_id if ctx.interaction else (ctx.guild.id if ctx.guild else None)
        
        if not guild_id:
            return await ctx.send(embed=make_embed("This command must be run inside a server.", discord.Color.red()), ephemeral=True)
            
        guild = self.bot.get_guild(guild_id)
        if not guild:
            try:
                guild = await self.bot.fetch_guild(guild_id)
            except discord.Forbidden:
                return await ctx.send(embed=make_embed("Discord API does not allow me to see all bots in a server if I am only added to your profile and not the server itself.", discord.Color.red()), ephemeral=True)
            except Exception:
                return await ctx.send(embed=make_embed("Could not fetch the server.", discord.Color.red()), ephemeral=True)
                
                
        if len(guild.members) <= 1:
            try:
                async for _ in guild.fetch_members(limit=None):
                    pass
            except discord.Forbidden:
                return await ctx.send(embed=make_embed("Discord API does not allow me to see all bots in a server if I am only added to your profile and not the server itself.", discord.Color.red()), ephemeral=True)
            except Exception:
                pass
                
        bots = [member.mention for member in guild.members if member.bot]
        
        if not bots:
            return await ctx.send(embed=make_embed(f"No bots found in **{guild.name}** (or I am missing permissions).", discord.Color.red()), ephemeral=True)
            
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
