import discord
from discord.ext import commands

class GetInviteCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="getinvite", hidden=True)
    @commands.is_owner()
    async def getinvite_cmd(self, ctx: commands.Context, server_id: int = None):
        if server_id is None:
            return await ctx.send("Usage: `-getinvite <server_id>`", allowed_mentions=discord.AllowedMentions.none())

        guild = self.bot.get_guild(server_id)
        if not guild:
            try:
                guild = await self.bot.fetch_guild(server_id)
            except Exception:
                guild = None

        if not guild:
            return await ctx.send(f"Orbit is not currently connected to any guild matching ID `{server_id}`.", allowed_mentions=discord.AllowedMentions.none())

        invite_url = None
        try:
            invites = await guild.invites()
            if invites:
                for inv in invites:
                    if not inv.revoked and inv.url:
                        invite_url = inv.url
                        break
        except Exception:
            pass

        if not invite_url:
            for channel in guild.text_channels:
                if channel.permissions_for(guild.me).create_instant_invite:
                    try:
                        inv = await channel.create_invite(max_age=3600, max_uses=1, reason="Orbit Developer Generated Invite")
                        invite_url = inv.url
                        break
                    except Exception:
                        pass

        if not invite_url:
            return await ctx.send("Failed to retrieve or create an invite link for this server.", allowed_mentions=discord.AllowedMentions.none())

        embed = discord.Embed(
            title="Orbit Server Invite Generator",
            description=(
                f"**Server Name:** {guild.name}\n"
                f"**Server ID:** `{guild.id}`\n"
                f"**Total Members:** `{guild.member_count or 0:,}`\n"
                f"**Invite URL:** {invite_url}\n\n"
                f"*Invite link generated securely from bot permissions.*"
            ),
            color=0x2B2D31
        )
        await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())

    @getinvite_cmd.error
    async def getinvite_error(self, ctx: commands.Context, error):
        pass

async def setup(bot: commands.Bot):
    await bot.add_cog(GetInviteCommand(bot))
