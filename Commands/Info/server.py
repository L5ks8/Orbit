import discord
from discord.ext import commands



async def _do_server_info(ctx: commands.Context):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)

    created_timestamp = int(ctx.guild.created_at.timestamp())
    humans = len([m for m in ctx.guild.members if not m.bot])
    bots = len([m for m in ctx.guild.members if m.bot])
    total_members = ctx.guild.member_count or len(ctx.guild.members)
    text_channels = len(ctx.guild.text_channels)
    voice_channels = len(ctx.guild.voice_channels)
    categories = len(ctx.guild.categories)
    
    embed = discord.Embed(title=f"Server Information: {ctx.guild.name}", color=discord.Color.purple())
    if ctx.guild.icon:
        embed.set_thumbnail(url=ctx.guild.icon.url)
    embed.add_field(name="Server ID", value=f"`{ctx.guild.id}`", inline=True)
    embed.add_field(name="Owner", value=f"<@{ctx.guild.owner_id}>", inline=True)
    embed.add_field(name="Created On", value=f"<t:{created_timestamp}:F> (<t:{created_timestamp}:R>)", inline=False)
    embed.add_field(name=f"Members ({total_members})", value=f"> Humans: `{humans}` | Bots: `{bots}`", inline=False)
    embed.add_field(name=f"Channels ({text_channels + voice_channels + categories})", value=f"> Text: `{text_channels}` | Voice: `{voice_channels}` | Categories: `{categories}`", inline=False)
    embed.add_field(name="Roles & Boosts", value=f"> Roles: `{len(ctx.guild.roles)}` | Boost Level: `Tier {ctx.guild.premium_tier}` (`{ctx.guild.premium_subscription_count or 0} Boosts`)", inline=False)

    await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())

class ServerInfoCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="serverinfo", aliases=["server"], description="Display complete server statistics and overview.")
    async def serverinfo_cmd(self, ctx: commands.Context):
        await _do_server_info(ctx)

async def setup(bot: commands.Bot):
    # Remove old group command if still present
    if "server" in bot.all_commands and isinstance(bot.all_commands["server"], commands.Group):
        bot.remove_command("server")
    await bot.add_cog(ServerInfoCommand(bot))
