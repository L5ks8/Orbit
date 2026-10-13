import discord
from discord import app_commands
from discord.ext import commands
import re
from Components.Commands._utils import make_embed, make_v2_card, ORBIT_COLOR, InteractionContext
from Components.emojis import Emojis

async def _do_purge(ctx, count: int, check_func=None, filter_name: str = "", user: discord.Member = None, after: str = None, is_all: bool = False):
    if not isinstance(ctx.channel, (discord.TextChannel, discord.VoiceChannel, discord.Thread)):
        return await ctx.send(embed=make_embed("This command can only be used in server channels.", discord.Color.red()), ephemeral=True, delete_after=5)

    if not is_all and (count < 1 or count > 100):
        return await ctx.send(embed=make_embed("Please specify an amount between 1 and 100.", discord.Color.red()), ephemeral=True, delete_after=5)
        
    def final_check(m: discord.Message) -> bool:
        if user and m.author.id != user.id:
            return False
        if check_func and not check_func(m):
            return False
        return True

    purge_kwargs = {"limit": count if not is_all else None, "check": final_check}
    
    if after:
        if not after.isdigit():
            return await ctx.send(embed=make_embed("The 'after' parameter must be a valid Message ID.", discord.Color.red()), ephemeral=True, delete_after=5)
        purge_kwargs["after"] = discord.Object(id=int(after))

    try:
        deleted = await ctx.channel.purge(**purge_kwargs)
        filter_text = f"\n**Filter:** {filter_name}" if filter_name else ""
        if user:
            filter_text += f"\n**User:** {user.mention}"
        if after:
            filter_text += f"\n**After ID:** `{after}`"
            
        desc = f"**Total Messages Deleted:** `{len(deleted)}`\n\n**Channel:** {ctx.channel.mention}\n**Moderator:** {ctx.author.mention}{filter_text}"
        card = make_v2_card(f"# Messages Purged\n\n{desc}", color=ORBIT_COLOR)
        if card:
            return await ctx.send(view=card, ephemeral=True, allowed_mentions=discord.AllowedMentions.none(), delete_after=5)
        embed = discord.Embed(
            title="Messages Purged",
            description=desc,
            color=ORBIT_COLOR
        )
        await ctx.send(embed=embed, ephemeral=True, allowed_mentions=discord.AllowedMentions.none(), delete_after=5)
    except discord.Forbidden:
        await ctx.send(embed=make_embed("I do not have sufficient permissions to delete messages in this channel.", discord.Color.red()), ephemeral=True, delete_after=5)
    except discord.HTTPException as e:
        await ctx.send(embed=make_embed(f"Could not delete messages (they may be older than 14 days): {e}", discord.Color.red()), ephemeral=True, delete_after=5)
    except Exception as e:
        await ctx.send(embed=make_embed(f"Error purging messages: {e}", discord.Color.red()), ephemeral=True, delete_after=5)


class PurgeCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    purge_group = app_commands.Group(name="purge", description="Deletes a number of messages.", default_permissions=discord.Permissions(manage_messages=True))

    @purge_group.command(name="messages", description="Deletes a number of messages.")
    @app_commands.checks.has_permissions(manage_messages=True)
    @app_commands.checks.bot_has_permissions(manage_messages=True)
    @app_commands.describe(
        count="Number of messages to delete (1-100)",
        user="Optional member to filter deleted messages by",
        after="Message ID to purge messages after"
    )
    async def purge_messages(self, interaction: discord.Interaction, count: int, user: discord.Member = None, after: str = None):
        ctx = InteractionContext(interaction)
        await ctx.defer(ephemeral=True)
        await _do_purge(ctx, count, None, "", user, after)

    @purge_group.command(name="normal", description="Deletes a number of messages.")
    @app_commands.checks.has_permissions(manage_messages=True)
    @app_commands.checks.bot_has_permissions(manage_messages=True)
    @app_commands.describe(
        count="Number of messages to delete (1-100)",
        user="Optional member to filter deleted messages by",
        after="Message ID to purge messages after"
    )
    async def purge_normal(self, interaction: discord.Interaction, count: int, user: discord.Member = None, after: str = None):
        ctx = InteractionContext(interaction)
        await ctx.defer(ephemeral=True)
        await _do_purge(ctx, count, None, "", user, after)

    @purge_group.command(name="all", description="Deletes all messages in the channel (up to 14 days old).")
    @app_commands.checks.has_permissions(manage_messages=True)
    async def purge_all(self, interaction: discord.Interaction):
        ctx = InteractionContext(interaction)
        await ctx.defer(ephemeral=True)
        await _do_purge(ctx, 0, None, "All", None, None, is_all=True)

    @purge_group.command(name="bots", description="Deletes messages sent by bots.")
    @app_commands.checks.has_permissions(manage_messages=True)
    @app_commands.describe(count="Number of messages to delete (1-100)", user="Optional member to filter deleted messages by", after="Message ID to purge messages after")
    async def purge_bots(self, interaction: discord.Interaction, count: int, user: discord.Member = None, after: str = None):
        ctx = InteractionContext(interaction)
        await ctx.defer(ephemeral=True)
        await _do_purge(ctx, count, lambda m: m.author.bot, "Bots", user, after)

    @purge_group.command(name="embeds", description="Deletes messages containing embeds.")
    @app_commands.checks.has_permissions(manage_messages=True)
    @app_commands.describe(count="Number of messages to delete (1-100)", user="Optional member to filter deleted messages by", after="Message ID to purge messages after")
    async def purge_embeds(self, interaction: discord.Interaction, count: int, user: discord.Member = None, after: str = None):
        ctx = InteractionContext(interaction)
        await ctx.defer(ephemeral=True)
        await _do_purge(ctx, count, lambda m: len(m.embeds) > 0, "Embeds", user, after)

    @purge_group.command(name="humans", description="Deletes messages sent by humans.")
    @app_commands.checks.has_permissions(manage_messages=True)
    @app_commands.describe(count="Number of messages to delete (1-100)", user="Optional member to filter deleted messages by", after="Message ID to purge messages after")
    async def purge_humans(self, interaction: discord.Interaction, count: int, user: discord.Member = None, after: str = None):
        ctx = InteractionContext(interaction)
        await ctx.defer(ephemeral=True)
        await _do_purge(ctx, count, lambda m: not m.author.bot, "Humans", user, after)

    @purge_group.command(name="images", description="Deletes messages containing images/attachments.")
    @app_commands.checks.has_permissions(manage_messages=True)
    @app_commands.describe(count="Number of messages to delete (1-100)", user="Optional member to filter deleted messages by", after="Message ID to purge messages after")
    async def purge_images(self, interaction: discord.Interaction, count: int, user: discord.Member = None, after: str = None):
        ctx = InteractionContext(interaction)
        await ctx.defer(ephemeral=True)
        await _do_purge(ctx, count, lambda m: len(m.attachments) > 0, "Images", user, after)

    @purge_group.command(name="invites", description="Deletes messages containing Discord invites.")
    @app_commands.checks.has_permissions(manage_messages=True)
    @app_commands.describe(count="Number of messages to delete (1-100)", user="Optional member to filter deleted messages by", after="Message ID to purge messages after")
    async def purge_invites(self, interaction: discord.Interaction, count: int, user: discord.Member = None, after: str = None):
        ctx = InteractionContext(interaction)
        await ctx.defer(ephemeral=True)
        await _do_purge(ctx, count, lambda m: "discord.gg/" in m.content.lower() or "discord.com/invite/" in m.content.lower(), "Invites", user, after)

    @purge_group.command(name="links", description="Deletes messages containing links.")
    @app_commands.checks.has_permissions(manage_messages=True)
    @app_commands.describe(count="Number of messages to delete (1-100)", user="Optional member to filter deleted messages by", after="Message ID to purge messages after")
    async def purge_links(self, interaction: discord.Interaction, count: int, user: discord.Member = None, after: str = None):
        ctx = InteractionContext(interaction)
        await ctx.defer(ephemeral=True)
        await _do_purge(ctx, count, lambda m: "http://" in m.content.lower() or "https://" in m.content.lower(), "Links", user, after)

    @purge_group.command(name="mentions", description="Deletes messages containing mentions.")
    @app_commands.checks.has_permissions(manage_messages=True)
    @app_commands.describe(count="Number of messages to delete (1-100)", user="Optional member to filter deleted messages by", after="Message ID to purge messages after")
    async def purge_mentions(self, interaction: discord.Interaction, count: int, user: discord.Member = None, after: str = None):
        ctx = InteractionContext(interaction)
        await ctx.defer(ephemeral=True)
        await _do_purge(ctx, count, lambda m: len(m.mentions) > 0 or len(m.role_mentions) > 0, "Mentions", user, after)


async def setup(bot: commands.Bot):
    await bot.add_cog(PurgeCog(bot))