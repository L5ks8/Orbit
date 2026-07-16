import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button

class GetInviteSuccessLayout(LayoutView):
    def __init__(self, guild: discord.Guild, invite_url: str):
        super().__init__()
        self.container = Container(
            TextDisplay(content="### Orbit Server Invite Generator"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(
                content=(
                    f"**Server Name:** {guild.name}\n"
                    f"**Server ID:** `{guild.id}`\n"
                    f"**Total Members:** `{guild.member_count or 0:,}`\n"
                    f"**Invite URL:** {invite_url}\n\n"
                    f"*Invite link generated securely from bot permissions.*"
                )
            )
        )
        self.add_item(self.container)

        btn_close = Button(label="Close Invite View", style=discord.ButtonStyle.secondary)

        async def _close_cb(interaction: discord.Interaction):
            try:
                await interaction.message.delete()
            except Exception:
                pass

        btn_close.callback = _close_cb
        self.add_item(ActionRow(btn_close))


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
                permissions = channel.permissions_for(guild.me)
                if permissions.create_instant_invite:
                    try:
                        new_invite = await channel.create_invite(max_age=86400, max_uses=0, reason="Owner requested server invite via -getinvite")
                        if new_invite and new_invite.url:
                            invite_url = new_invite.url
                            break
                    except Exception:
                        continue

        if not invite_url:
            return await ctx.send(f"Could not generate an invite for **{guild.name}** (`{guild.id}`). Orbit lacks `Create Instant Invite` permissions on all text channels.", allowed_mentions=discord.AllowedMentions.none())

        view = GetInviteSuccessLayout(guild, invite_url)
        await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

    @getinvite_cmd.error
    async def getinvite_error(self, ctx: commands.Context, error):
        if not isinstance(error, commands.NotOwner):
            await ctx.send(f"Getinvite Error: {error}", allowed_mentions=discord.AllowedMentions.none())


async def setup(bot: commands.Bot):
    await bot.add_cog(GetInviteCommand(bot))
