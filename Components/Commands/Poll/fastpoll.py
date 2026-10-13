import time
import discord
from discord import app_commands
from discord.ext import commands
from Components.Commands.Poll.poll import build_poll_kwargs
from Components.Commands.Poll._storage import (
    generate_poll_id,
    create_poll_entry,
    update_poll_entry
)
from Components.Commands._utils import make_embed, InteractionContext

class FastPollCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @app_commands.command(
        name="fastpoll",
        description="Creates a quick, interactive Yes/No poll with visual progress bars."
    )
    @app_commands.describe(
        question="The Yes/No question to ask",
        duration="Poll duration in minutes (e.g. 60 for 1 hour, 1440 for 24 hours)"
    )
    async def fastpoll(self, interaction: discord.Interaction, question: str, duration: int = 60):
        ctx = InteractionContext(interaction)
        await ctx.defer()
        if not ctx.guild:
            return await ctx.send(embed=make_embed("This command must be run inside a server.", discord.Color.red()), ephemeral=True)

        if duration < 1 or duration > 43200:
            duration = 60

        opts = ["Yes", "No"]
        poll_id = generate_poll_id(ctx.guild.id)
        now = int(time.time())
        end_time = now + (duration * 60)

        entry = create_poll_entry(
            guild_id=ctx.guild.id,
            poll_id=poll_id,
            channel_id=ctx.channel.id,
            message_id=0,
            question=question,
            options=opts,
            author_id=ctx.author.id,
            duration_minutes=duration,
            end_timestamp=end_time
        )

        kwargs = build_poll_kwargs(entry, ended=False)
        msg = await ctx.send(**kwargs, allowed_mentions=discord.AllowedMentions.none())

        if msg:
            entry["message_id"] = msg.id
            entry["channel_id"] = msg.channel.id
            update_poll_entry(ctx.guild.id, entry)

    @fastpoll.error
    async def fastpoll_error(self, interaction: discord.Interaction, error):
        ctx = InteractionContext(interaction)
        if isinstance(error, (app_commands.AppCommandError, commands.MissingRequiredArgument)):
            await ctx.send(embed=make_embed("Usage: `/fastpoll <question> [duration_in_minutes]`", discord.Color.red()), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(FastPollCommand(bot))
