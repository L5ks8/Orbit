import discord
from discord import app_commands
from discord.ext import commands

from Commands._utils import MemberOrIDConverter, format_usage

async def _do_purge(ctx: commands.Context, count_str: str, user: discord.Member = None):
    if not isinstance(ctx.channel, (discord.TextChannel, discord.VoiceChannel, discord.Thread)):
        return await ctx.send("This command can only be used in server channels.", ephemeral=True, delete_after=5)

    clean_str = count_str.strip().lower()
    is_all = (clean_str == "all")

    if is_all:
        limit = 100
        check = None
    elif clean_str.isdigit():
        limit = int(clean_str)
        if limit < 1 or limit > 100:
            return await ctx.send("Please specify an amount between 1 and 100, or `all`.", ephemeral=True, delete_after=5)
        def check(m: discord.Message) -> bool:
            if user:
                return m.author.id == user.id
            return True
    else:
        return await ctx.send("Invalid purge count. Please specify a number (`e.g. 20`) or `all`.", ephemeral=True, delete_after=5)

    try:
        if check:
            deleted = await ctx.channel.purge(limit=limit, check=check)
        else:
            deleted = await ctx.channel.purge(limit=limit)
        from Embeds import get_command_embed
        kwargs = get_command_embed(
            ctx.guild.id, "purge", msg_type="success",
            count=len(deleted), channel_mention=ctx.channel.mention,
            author_mention=ctx.author.mention,
            filter_user_mention=user.mention if user else None,
            is_all=is_all
        )
        await ctx.send(**kwargs, ephemeral=True, allowed_mentions=discord.AllowedMentions.none(), delete_after=5)
    except discord.Forbidden:
        await ctx.send("I do not have sufficient permissions to delete messages in this channel.", ephemeral=True, delete_after=5)
    except discord.HTTPException as e:
        await ctx.send(f"Could not delete messages (they may be older than 14 days): {e}", ephemeral=True, delete_after=5)
    except Exception as e:
        await ctx.send(f"Error purging messages: {e}", ephemeral=True, delete_after=5)

@commands.hybrid_command(name="purge", aliases=["clear", "clean", "prg"], description="Purge messages (`/purge 20` or `/purge all`).")
@commands.has_permissions(manage_messages=True)
@commands.bot_has_permissions(manage_messages=True)
@app_commands.describe(
    count="Number of messages to delete (1-100) or 'all'",
    user="Optional member to filter deleted messages by"
)
async def purge_cmd(ctx: commands.Context, count: str, user: discord.Member = None):
    await ctx.defer(ephemeral=True)
    await _do_purge(ctx, count, user)

class PurgeCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @purge_cmd.error
    async def purge_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need Manage Messages permission to purge messages.", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

class PurgePrefixFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="purge_prefix_helper", hidden=True)
    @commands.has_permissions(manage_messages=True)
    async def purge_prefix(self, ctx: commands.Context, count: str = None, user: discord.Member = None):
        if not count:
            return await ctx.send(format_usage("-purge", "<number|all>", "[@member]"), ephemeral=True)
        await _do_purge(ctx, count, user)

async def setup(bot: commands.Bot):
    if "purge" not in bot.all_commands:
        bot.add_command(purge_cmd)
    await bot.add_cog(PurgeCog(bot))
    await bot.add_cog(PurgePrefixFallback(bot))

