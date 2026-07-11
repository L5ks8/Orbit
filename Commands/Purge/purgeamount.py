import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Commands.Purge._group import purge_group

class PurgeAmountSuccessLayout(LayoutView):
    def __init__(self, count: int, channel: discord.TextChannel, author: discord.Member, filter_user: discord.Member | None):
        super().__init__()
        filter_text = f"\n**Filter:** Messages from {filter_user.mention}" if filter_user else ""
        self.container = Container(
            TextDisplay(content=f"### Messages Purged\n**Deleted:** `{count} messages`"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Channel:** {channel.mention}\n**Moderator:** {author.mention}{filter_text}")
        )
        self.add_item(self.container)

async def _do_purge_amount(ctx: commands.Context, amount: int, user: discord.Member | None):
    if amount < 1 or amount > 100:
        return await ctx.send("Please specify an amount between 1 and 100.", ephemeral=True)

    def check(m: discord.Message) -> bool:
        if user:
            return m.author.id == user.id
        return True

    try:
        deleted = await ctx.channel.purge(limit=amount, check=check)
        view = PurgeAmountSuccessLayout(len(deleted), ctx.channel, ctx.author, user)
        await ctx.send(view=view, ephemeral=True, allowed_mentions=discord.AllowedMentions.none())
    except discord.Forbidden:
        await ctx.send("I do not have sufficient permissions to delete messages in this channel.", ephemeral=True)
    except discord.HTTPException as e:
        await ctx.send(f"Could not delete messages (they may be older than 14 days): {e}", ephemeral=True)
    except Exception as e:
        await ctx.send(f"Error purging messages: {e}", ephemeral=True)

@purge_group.command(name="amount", description="Bulk deletes up to 100 recent messages (`/purge amount <1-100>`).")
@commands.has_permissions(manage_messages=True)
@commands.bot_has_permissions(manage_messages=True)
async def purge_amount_cmd(ctx: commands.Context, amount: int, user: discord.Member = None):
    await ctx.defer(ephemeral=True)
    await _do_purge_amount(ctx, amount, user)

class PurgeAmountCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @purge_amount_cmd.error
    async def purge_amount_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need Manage Messages permission to purge messages.", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(PurgeAmountCommand(bot))
