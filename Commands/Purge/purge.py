import discord
from discord import app_commands
from discord.ext import commands
import re

async def _do_purge(ctx: commands.Context, count: int, check_func=None, filter_name: str = "", user: discord.Member = None):
    if not isinstance(ctx.channel, (discord.TextChannel, discord.VoiceChannel, discord.Thread)):
        return await ctx.send("This command can only be used in server channels.", ephemeral=True, delete_after=5)

    if count < 1 or count > 100:
        return await ctx.send("Please specify an amount between 1 and 100.", ephemeral=True, delete_after=5)
        
    def final_check(m: discord.Message) -> bool:
        if user and m.author.id != user.id:
            return False
        if check_func and not check_func(m):
            return False
        return True

    try:
        deleted = await ctx.channel.purge(limit=count, check=final_check)
        filter_text = f"\n**Filter:** {filter_name}" if filter_name else ""
        if user:
            filter_text += f"\n**User:** {user.mention}"
            
        embed = discord.Embed(
            title="Messages Purged",
            description=f"**Total Messages Deleted:** `{len(deleted)}`\n\n**Channel:** {ctx.channel.mention}\n**Moderator:** {ctx.author.mention}{filter_text}",
            color=discord.Color.green()
        )
        await ctx.send(embed=embed, ephemeral=True, allowed_mentions=discord.AllowedMentions.none(), delete_after=5)
    except discord.Forbidden:
        await ctx.send("I do not have sufficient permissions to delete messages in this channel.", ephemeral=True, delete_after=5)
    except discord.HTTPException as e:
        await ctx.send(f"Could not delete messages (they may be older than 14 days): {e}", ephemeral=True, delete_after=5)
    except Exception as e:
        await ctx.send(f"Error purging messages: {e}", ephemeral=True, delete_after=5)


class PurgeCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_group(name="purge", aliases=["clear", "clean", "prg"], fallback="normal", description="Deletes a number of messages.")
    @commands.has_permissions(manage_messages=True)
    @commands.bot_has_permissions(manage_messages=True)
    @app_commands.describe(
        count="Number of messages to delete (1-100)",
        user="Optional member to filter deleted messages by"
    )
    async def purge_group(self, ctx: commands.Context, count: int, user: discord.Member = None):
        await ctx.defer(ephemeral=True)
        await _do_purge(ctx, count, None, "", user)

    @purge_group.command(name="bots", description="Deletes messages sent by bots.")
    @commands.has_permissions(manage_messages=True)
    @app_commands.describe(count="Number of messages to delete (1-100)")
    async def purge_bots(self, ctx: commands.Context, count: int):
        await ctx.defer(ephemeral=True)
        await _do_purge(ctx, count, lambda m: m.author.bot, "Bots")

    @purge_group.command(name="embeds", description="Deletes messages containing embeds.")
    @commands.has_permissions(manage_messages=True)
    @app_commands.describe(count="Number of messages to delete (1-100)")
    async def purge_embeds(self, ctx: commands.Context, count: int):
        await ctx.defer(ephemeral=True)
        await _do_purge(ctx, count, lambda m: len(m.embeds) > 0, "Embeds")

    @purge_group.command(name="humans", description="Deletes messages sent by humans.")
    @commands.has_permissions(manage_messages=True)
    @app_commands.describe(count="Number of messages to delete (1-100)")
    async def purge_humans(self, ctx: commands.Context, count: int):
        await ctx.defer(ephemeral=True)
        await _do_purge(ctx, count, lambda m: not m.author.bot, "Humans")

    @purge_group.command(name="images", description="Deletes messages containing images/attachments.")
    @commands.has_permissions(manage_messages=True)
    @app_commands.describe(count="Number of messages to delete (1-100)")
    async def purge_images(self, ctx: commands.Context, count: int):
        await ctx.defer(ephemeral=True)
        await _do_purge(ctx, count, lambda m: len(m.attachments) > 0, "Images")

    @purge_group.command(name="invites", description="Deletes messages containing Discord invites.")
    @commands.has_permissions(manage_messages=True)
    @app_commands.describe(count="Number of messages to delete (1-100)")
    async def purge_invites(self, ctx: commands.Context, count: int):
        await ctx.defer(ephemeral=True)
        await _do_purge(ctx, count, lambda m: "discord.gg/" in m.content.lower() or "discord.com/invite/" in m.content.lower(), "Invites")

    @purge_group.command(name="links", description="Deletes messages containing links.")
    @commands.has_permissions(manage_messages=True)
    @app_commands.describe(count="Number of messages to delete (1-100)")
    async def purge_links(self, ctx: commands.Context, count: int):
        await ctx.defer(ephemeral=True)
        await _do_purge(ctx, count, lambda m: "http://" in m.content.lower() or "https://" in m.content.lower(), "Links")

    @purge_group.command(name="mentions", description="Deletes messages containing mentions.")
    @commands.has_permissions(manage_messages=True)
    @app_commands.describe(count="Number of messages to delete (1-100)")
    async def purge_mentions(self, ctx: commands.Context, count: int):
        await ctx.defer(ephemeral=True)
        await _do_purge(ctx, count, lambda m: len(m.mentions) > 0 or len(m.role_mentions) > 0, "Mentions")

    @purge_group.error
    @purge_bots.error
    @purge_embeds.error
    @purge_humans.error
    @purge_images.error
    @purge_invites.error
    @purge_links.error
    @purge_mentions.error
    async def purge_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need Manage Messages permission to purge messages.", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

async def setup(bot: commands.Bot):
    bot.remove_command("purge")
    await bot.add_cog(PurgeCog(bot))
