import discord
from discord.ext import commands

class GuildInfoCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="guildinfo", hidden=True)
    @commands.is_owner()
    async def guild_info(self, ctx: commands.Context, guild_id: int):
        guild = self.bot.get_guild(guild_id)
        if not guild:
            return await ctx.send(embed=discord.Embed(description="I am not in a server with that ID.", color=discord.Color.red()))
            
        embed = discord.Embed(title=f"Guild Info: {guild.name}", color=0x2B2D31)
        if guild.icon:
            embed.set_thumbnail(url=guild.icon.url)
            
        embed.add_field(name="Owner", value=f"{guild.owner} (`{guild.owner_id}`)", inline=False)
        embed.add_field(name="Members", value=f"{guild.member_count:,}", inline=True)
        embed.add_field(name="Text Channels", value=str(len(guild.text_channels)), inline=True)
        embed.add_field(name="Roles", value=str(len(guild.roles)), inline=True)
        
        joined_at = discord.utils.format_dt(guild.me.joined_at, "R") if guild.me.joined_at else "Unknown"
        created_at = discord.utils.format_dt(guild.created_at, "d")
        
        embed.add_field(name="Bot Joined", value=joined_at, inline=True)
        embed.add_field(name="Created", value=created_at, inline=True)
        
        features = ", ".join(guild.features) if guild.features else "None"
        embed.add_field(name="Features", value=f"`{features}`"[:1000], inline=False)
        
        embed.set_footer(text=f"Guild ID: {guild.id}")
        await ctx.send(embed=embed)

async def setup(bot: commands.Bot):
    await bot.add_cog(GuildInfoCommand(bot))
