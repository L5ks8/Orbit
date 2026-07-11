import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Commands.Purge._group import purge_group

class PurgeAllSuccessLayout(LayoutView):
    def __init__(self, count: int, channel: discord.TextChannel, author: discord.Member):
        super().__init__()
        self.container = Container(
            TextDisplay(content=f"### Channel Purged Completely\n**Total Messages Deleted:** `{count}`"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Channel:** {channel.mention}\n**Moderator:** {author.mention}")
        )
        self.add_item(self.container)

async def _do_purge_all(ctx: commands.Context):
    if not isinstance(ctx.channel, (discord.TextChannel, discord.VoiceChannel, discord.Thread)):
        return await ctx.send("This command can only be used in server channels.", ephemeral=True)

    try:
        deleted = await ctx.channel.purge(limit=10000)
        view = PurgeAllSuccessLayout(len(deleted), ctx.channel, ctx.author)
        await ctx.send(view=view, ephemeral=True, allowed_mentions=discord.AllowedMentions.none())
    except discord.Forbidden:
        await ctx.send("I do not have sufficient permissions to bulk delete messages in this channel.", ephemeral=True)
    except discord.HTTPException as e:
        await ctx.send(f"Could not delete messages (they may be older than 14 days): {e}", ephemeral=True)
    except Exception as e:
        await ctx.send(f"Error purging channel messages: {e}", ephemeral=True)

@purge_group.command(name="all", description="Bulk deletes all messages in this channel (`/purge all`).")
@commands.has_permissions(manage_messages=True)
@commands.bot_has_permissions(manage_messages=True)
async def purge_all_cmd(ctx: commands.Context):
    await ctx.defer(ephemeral=True)
    await _do_purge_all(ctx)

class PurgeAllCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @purge_all_cmd.error
    async def purge_all_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need Manage Messages permission to purge messages.", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(PurgeAllCommand(bot))
