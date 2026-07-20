import datetime
import discord
from discord import app_commands
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button
from Commands.Poll.poll import ComponentsPollView
from Commands.Poll._storage import generate_poll_id, create_poll_entry

class FastPollCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(
        name="fastpoll",
        description="Creates a visual bar Yes/No poll with duration in minutes."
    )
    @app_commands.describe(
        question="The Yes/No question to ask",
        duration="Poll duration in minutes (e.g. 60 for 1 hour, 1440 for 24 hours)"
    )
    async def fastpoll(self, ctx: commands.Context, question: str, duration: int = 60):
        await ctx.defer()
        if not ctx.guild:
            return await ctx.send("This command must be run inside a server.", ephemeral=True)

        if duration < 1 or duration > 46080:
            duration = 60

        opts = ["Yes", "No"]
        poll_id = generate_poll_id(ctx.guild.id)
        view = ComponentsPollView(ctx.guild.id, poll_id, question, opts, ctx.author, duration)
        msg = await ctx.send(**view.get_kwargs(), allowed_mentions=discord.AllowedMentions.none())

        if msg:
            create_poll_entry(
                guild_id=ctx.guild.id,
                poll_id=poll_id,
                channel_id=msg.channel.id,
                message_id=msg.id,
                question=question,
                options=opts,
                author_id=ctx.author.id
            )

    @fastpoll.error
    async def fastpoll_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingRequiredArgument):
            await ctx.send("Usage: -fastpoll \"<question>\" [duration_in_minutes]", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(FastPollCommand(bot))

