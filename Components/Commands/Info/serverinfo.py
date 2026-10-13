import discord
from discord import app_commands
from discord.ext import commands
from Components.Commands._utils import make_embed, ORBIT_COLOR, make_v2_card, InteractionContext
from Components.emojis import Emojis


async def _do_server_info(ctx: commands.Context):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send(embed=make_embed("This command must be run inside a server.", discord.Color.red()), ephemeral=True)

    created_timestamp = int(ctx.guild.created_at.timestamp())
    humans = len([m for m in ctx.guild.members if not m.bot])
    bots = len([m for m in ctx.guild.members if m.bot])
    total_members = ctx.guild.member_count or len(ctx.guild.members)
    text_channels = len(ctx.guild.text_channels)
    voice_channels = len(ctx.guild.voice_channels)
    categories = len(ctx.guild.categories)
    
    body = (
        f"# Server Information: {ctx.guild.name}\n\n"
        f"**Server ID:** `{ctx.guild.id}` · **Owner:** <@{ctx.guild.owner_id}>\n"
        f"**Created On:** <t:{created_timestamp}:F> (<t:{created_timestamp}:R>)\n\n"
        f"### Members ({total_members})\n"
        f"> Humans: `{humans}` | Bots: `{bots}`\n\n"
        f"### Channels ({text_channels + voice_channels + categories})\n"
        f"> Text: `{text_channels}` | Voice: `{voice_channels}` | Categories: `{categories}`\n\n"
        f"### Roles & Boosts\n"
        f"> Roles: `{len(ctx.guild.roles)}` | Boost Level: `Tier {ctx.guild.premium_tier}` (`{ctx.guild.premium_subscription_count or 0} Boosts`)"
    )
    

    embed = discord.Embed(title=f"Server Information: {ctx.guild.name}", color=ORBIT_COLOR)
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

    @app_commands.command(name="serverinfo", description="Display complete server statistics and overview.")
    async def serverinfo_cmd(self, interaction: discord.Interaction):
        ctx = InteractionContext(interaction)
        await _do_server_info(ctx)

    @app_commands.command(name="membercount", description="Get the server member count.")
    async def membercount_cmd(self, interaction: discord.Interaction):
        ctx = InteractionContext(interaction)
        if not ctx.guild:
            return await ctx.send(embed=make_embed("This command must be run inside a server.", discord.Color.red()), ephemeral=True)
            
        count = ctx.guild.member_count or len(ctx.guild.members)
        card = make_v2_card(f"# Members in {ctx.guild.name}\n\nTotal: **{count:,}**", color=ORBIT_COLOR)
        if card:
            return await ctx.send(view=card)

        embed = discord.Embed(
            title="Members",
            description=str(count),
            color=ORBIT_COLOR
        )
        embed.timestamp = discord.utils.utcnow()
        await ctx.send(embed=embed)

async def setup(bot: commands.Bot):
    if "server" in bot.all_commands and isinstance(bot.all_commands["server"], commands.Group):
        bot.remove_command("server")
    await bot.add_cog(ServerInfoCommand(bot))