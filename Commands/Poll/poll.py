import datetime
import discord
from discord import app_commands
from discord.ext import commands
from discord.ui import Button
from Commands.Poll._storage import generate_poll_id, create_poll_entry, get_poll_entry

def make_bar(pct: int, length: int = 15) -> str:
    filled = int(round((pct / 100.0) * length))
    filled = max(0, min(length, filled))
    empty = length - filled
    return "â–ˆ" * filled + "â–‘" * empty

class ComponentsPollView(discord.ui.View):
    def __init__(self, guild_id: int, poll_id: str, question: str, options: list[str], author: discord.Member, duration_minutes: int):
        super().__init__(timeout=None)
        self.guild_id = guild_id
        self.poll_id = poll_id
        self.question = question
        self.options = options
        self.author = author
        self.duration_minutes = duration_minutes
        self.votes: dict[str, set[int]] = {opt: set() for opt in options}
    def get_kwargs(self):
        buttons = []
        for idx, opt in enumerate(self.options, 1):
            btn = Button(label=f"Vote #{idx}", style=discord.ButtonStyle.primary)

            async def vote_cb(interaction: discord.Interaction, o=opt):
                poll_info = get_poll_entry(interaction.guild.id, self.poll_id) if interaction.guild else None
                if poll_info and poll_info.get("closed"):
                    return await interaction.response.send_message("This poll has been closed and no longer accepts votes.", ephemeral=True)

                uid = interaction.user.id
                for s in self.votes.values():
                    s.discard(uid)
                self.votes[o].add(uid)
                await interaction.response.edit_message(**self.get_kwargs())

            btn.callback = vote_cb
            buttons.append(btn)

        total_votes = sum(len(v) for v in self.votes.values())
        
        dur_str = f"{self.duration_minutes}m ({round(self.duration_minutes/60, 1)}h)" if self.duration_minutes >= 60 else f"{self.duration_minutes}m"
        
        lines = []
        for idx, opt in enumerate(self.options, 1):
            v_count = len(self.votes.get(opt, set()))
            pct = int(round((v_count / total_votes) * 100)) if total_votes > 0 else 0
            bar = make_bar(pct, length=12)
            lines.append(f"**`#{idx}` {opt}**\n`{bar}` **`{pct}%`** (`{v_count} votes`)")
            
        content_str = "\n\n".join(lines)
        
        embed = discord.Embed(
            title="Community Poll",
            description=f"**Question:** {self.question}\n**Author:** {self.author.mention} | **Duration:** `{dur_str}` | **Total Votes:** `{total_votes}`\n\n{content_str}",
            color=discord.Color.blue()
        )
        embed.set_footer(text=f"Poll ID: {self.poll_id}")
        
        self.clear_items()
        for btn in buttons:
            self.add_item(btn)
            
        return {"embed": embed, "view": self}

class PollCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(
        name="poll",
        description="Creates a visual bar poll with options separated by commas and duration in minutes."
    )
    @app_commands.describe(
        question="The poll question to ask",
        options="Comma-separated options (e.g. Red, Blue, Green)",
        duration="Poll duration in minutes (e.g. 60 for 1 hour, 1440 for 24 hours)"
    )
    async def poll(self, ctx: commands.Context, question: str, options: str, duration: int = 60):
        await ctx.defer()
        if not ctx.guild:
            return await ctx.send("This command must be run inside a server.", ephemeral=True)

        opts = [o.strip() for o in options.split(",") if o.strip()]
        if len(opts) < 2 or len(opts) > 10:
            return await ctx.send("Please specify between 2 and 10 options separated by commas (`Option 1, Option 2, Option 3`).", ephemeral=True)

        if duration < 1 or duration > 46080:
            duration = 60

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

    @poll.error
    async def poll_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingRequiredArgument):
            await ctx.send("Usage: -poll \"<question>\" \"<option1, option2, option3>\" [duration_in_minutes]", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(PollCommand(bot))

