import datetime
import time
import discord
from discord import app_commands
from discord.ext import commands, tasks
from discord.ui import Button, View
from Components.Commands.Poll._storage import (
    generate_poll_id,
    create_poll_entry,
    get_poll_entry,
    update_poll_entry,
    record_vote,
    remove_vote,
    close_poll_entry,
    get_all_active_polls
)
from Components.Commands._utils import (
    make_embed,
    ORBIT_COLOR,
    InteractionContext,
    HAS_V2,
    Container,
    TextDisplay,
    ActionRow,
    LayoutView
)

def make_bar(pct: int, length: int = 10) -> str:
    """Renders a modern, clean solid progress bar without dots."""
    filled = int(round((pct / 100.0) * length))
    filled = max(0, min(length, filled))
    empty = length - filled
    return "▰" * filled + "▱" * empty

def build_poll_embed(entry: dict, ended: bool = False, closed_by: int | None = None) -> discord.Embed:
    question = entry.get("question", "Community Poll")
    author_id = entry.get("author_id")
    end_ts = entry.get("end_timestamp", int(time.time()))
    options = entry.get("options", [])
    raw_votes = entry.get("votes", {})

    counts = []
    total_votes = 0
    for idx in range(len(options)):
        uids = raw_votes.get(str(idx), [])
        if not isinstance(uids, list):
            uids = []
        counts.append(len(uids))
        total_votes += len(uids)

    lines = [
        f"### {question}\n"
    ]

    if ended:
        lines.append(f"**Status:** Closed <t:{end_ts}:R>")
    else:
        lines.append(f"**Ends:** <t:{end_ts}:R> (<t:{end_ts}:f>)")

    if author_id:
        lines.append(f"**Hosted by:** <@{author_id}> · **Total Votes:** `{total_votes}`\n")
    else:
        lines.append(f"**Total Votes:** `{total_votes}`\n")

    max_votes = max(counts) if counts else 0
    winner_indices = [i for i, c in enumerate(counts) if c == max_votes and max_votes > 0] if ended else []

    option_blocks = []
    for idx, opt in enumerate(options):
        v_count = counts[idx]
        pct = int(round((v_count / total_votes) * 100)) if total_votes > 0 else 0
        bar = make_bar(pct, length=10)
        vote_text = "1 vote" if v_count == 1 else f"{v_count} votes"

        crown = " 🏆" if ended and idx in winner_indices else ""
        opt_line = f"**{idx + 1}. {opt}{crown}**\n`{bar}` **`{pct}%`** · {vote_text}"
        option_blocks.append(opt_line)

    lines.append("\n\n".join(option_blocks))

    if ended and winner_indices:
        if len(winner_indices) == 1:
            win_name = options[winner_indices[0]]
            lines.append(f"\n\n🏆 **Winner:** **{win_name}** with **{max_votes}** votes!")
        else:
            win_names = ", ".join(f"**{options[i]}**" for i in winner_indices)
            lines.append(f"\n\n🤝 **Tie:** {win_names} with **{max_votes}** votes each!")
    elif ended and total_votes == 0:
        lines.append("\n\n*No votes were cast.*")

    poll_id = entry.get("poll_id", "")
    embed = discord.Embed(
        title="Community Poll",
        description="\n".join(lines),
        color=ORBIT_COLOR if not ended else discord.Color(0x2B2D31)
    )

    if ended:
        embed.set_footer(text=f"Poll ID: #{poll_id} · Voting has concluded.")
    else:
        embed.set_footer(text=f"Poll ID: #{poll_id} · Click a button below to cast or toggle your vote.")

    return embed

def build_poll_view(entry: dict, ended: bool = False) -> discord.ui.View:
    view = discord.ui.View(timeout=None)
    poll_id = entry.get("poll_id", "")
    options = entry.get("options", [])

    if ended:
        view.add_item(Button(
            label="Closed",
            style=discord.ButtonStyle.secondary,
            disabled=True,
            custom_id=f"orbit:poll_closed:{poll_id}"
        ))
        return view

    for idx, opt in enumerate(options):
        # Short clean option labels
        clean_name = opt.strip()
        if len(clean_name) <= 22 and "\n" not in clean_name:
            btn_label = f"{idx + 1}. {clean_name}"
        else:
            btn_label = f"Vote #{idx + 1}"

        btn = Button(
            label=btn_label,
            style=discord.ButtonStyle.primary,
            custom_id=f"orbit:poll_vote:{poll_id}:{idx}"
        )
        view.add_item(btn)

    # Clean withdraw button
    view.add_item(Button(
        label="Remove Vote",
        style=discord.ButtonStyle.secondary,
        custom_id=f"orbit:poll_leave:{poll_id}"
    ))

    return view

def build_poll_v2_view(entry: dict, ended: bool = False):
    if not HAS_V2:
        return None
    view = LayoutView(timeout=None)
    poll_id = entry.get("poll_id", "")
    options = entry.get("options", [])
    question = entry.get("question", "Community Poll")
    author_id = entry.get("author_id")
    end_ts = entry.get("end_timestamp", int(time.time()))
    raw_votes = entry.get("votes", {})

    counts = []
    total_votes = 0
    for idx in range(len(options)):
        uids = raw_votes.get(str(idx), [])
        if not isinstance(uids, list):
            uids = []
        counts.append(len(uids))
        total_votes += len(uids)

    lines = [
        f"**{question}**\n"
    ]

    if ended:
        lines.append(f"**Status:** Closed <t:{end_ts}:R>")
    else:
        lines.append(f"**Ends:** <t:{end_ts}:R> (<t:{end_ts}:f>)")

    if author_id:
        lines.append(f"**Hosted by:** <@{author_id}> · **Total Votes:** `{total_votes}`\n")
    else:
        lines.append(f"**Total Votes:** `{total_votes}`\n")

    max_votes = max(counts) if counts else 0
    winner_indices = [i for i, c in enumerate(counts) if c == max_votes and max_votes > 0] if ended else []

    option_blocks = []
    for idx, opt in enumerate(options):
        v_count = counts[idx]
        pct = int(round((v_count / total_votes) * 100)) if total_votes > 0 else 0
        bar = make_bar(pct, length=10)
        vote_text = "1 vote" if v_count == 1 else f"{v_count} votes"

        crown = " 🏆" if ended and idx in winner_indices else ""
        opt_line = f"**{idx + 1}. {opt}{crown}**\n`{bar}` **`{pct}%`** · {vote_text}"
        option_blocks.append(opt_line)

    lines.append("\n\n".join(option_blocks))

    if ended and winner_indices:
        if len(winner_indices) == 1:
            win_name = options[winner_indices[0]]
            lines.append(f"\n\n🏆 **Winner:** **{win_name}** with **{max_votes}** votes!")
        else:
            win_names = ", ".join(f"**{options[i]}**" for i in winner_indices)
            lines.append(f"\n\n🤝 **Tie:** {win_names} with **{max_votes}** votes each!")
    elif ended and total_votes == 0:
        lines.append("\n\n*No votes were cast.*")

    body_text = "\n".join(lines)

    rows = []
    if ended:
        btn_closed = Button(
            label="Closed",
            style=discord.ButtonStyle.secondary,
            disabled=True,
            custom_id=f"orbit:poll_closed:{poll_id}"
        )
        rows.append(ActionRow(btn_closed))
    else:
        current_buttons = []
        for idx, opt in enumerate(options):
            clean_name = opt.strip()
            if len(clean_name) <= 20 and "\n" not in clean_name:
                btn_label = f"{idx + 1}. {clean_name}"
            else:
                btn_label = f"Vote #{idx + 1}"

            btn = Button(
                label=btn_label,
                style=discord.ButtonStyle.primary,
                custom_id=f"orbit:poll_vote:{poll_id}:{idx}"
            )
            current_buttons.append(btn)
            if len(current_buttons) == 5:
                rows.append(ActionRow(*current_buttons))
                current_buttons = []

        btn_leave = Button(
            label="Remove Vote",
            style=discord.ButtonStyle.secondary,
            custom_id=f"orbit:poll_leave:{poll_id}"
        )
        current_buttons.append(btn_leave)
        if current_buttons:
            rows.append(ActionRow(*current_buttons))

    container = Container(
        TextDisplay(content=f"# Community Poll\n\n{body_text}"),
        *rows,
        accent_color=ORBIT_COLOR if not ended else discord.Color(0x2B2D31)
    )
    view.add_item(container)
    footer_text = f"Poll ID: #{poll_id} · Voting has concluded." if ended else f"Poll ID: #{poll_id} · Click a button above to cast or toggle your vote."
    view.add_item(TextDisplay(content=f"-# {footer_text}"))
    return view

def build_poll_kwargs(entry: dict, ended: bool = False, closed_by: int | None = None) -> dict:
    if HAS_V2:
        try:
            v2_view = build_poll_v2_view(entry, ended=ended)
            if v2_view:
                return {"embed": None, "view": v2_view}
        except Exception as e:
            print(f"[Poll] V2 view build failed ({e}), falling back to embed.")

    embed = build_poll_embed(entry, ended=ended, closed_by=closed_by)
    view = build_poll_view(entry, ended=ended)
    return {"embed": embed, "view": view}

async def end_poll_logic(bot: commands.Bot, guild_id: int, entry: dict, closed_by: int | None = None) -> bool:
    if entry.get("closed"):
        return False

    entry["closed"] = True
    if closed_by:
        entry["closed_by"] = closed_by
    update_poll_entry(guild_id, entry)

    guild = bot.get_guild(guild_id)
    if not guild:
        try:
            guild = await bot.fetch_guild(guild_id)
        except Exception:
            return False

    channel = guild.get_channel(entry.get("channel_id"))
    if not channel:
        try:
            channel = await guild.fetch_channel(entry.get("channel_id"))
        except Exception:
            return False

    try:
        msg = await channel.fetch_message(entry.get("message_id"))
        if msg:
            kwargs = build_poll_kwargs(entry, ended=True, closed_by=closed_by)
            await msg.edit(**kwargs)
    except Exception as e:
        print(f"[Poll] Failed to edit expired poll message: {e}")

    return True

class PollCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.poll_check_loop.start()

    def cog_unload(self):
        self.poll_check_loop.cancel()

    @tasks.loop(seconds=5)
    async def poll_check_loop(self):
        try:
            active = get_all_active_polls()
            now = int(time.time())
            for gid, entry in active:
                if now >= entry.get("end_timestamp", 0):
                    await end_poll_logic(self.bot, gid, entry)
        except Exception:
            pass

    @poll_check_loop.before_loop
    async def before_poll_loop(self):
        await self.bot.wait_until_ready()

    @app_commands.command(
        name="poll",
        description="Creates a sleek, interactive community poll with visual progress bars."
    )
    @app_commands.describe(
        question="The poll question to ask",
        options="Comma-separated options (e.g. Red, Blue, Green)",
        duration="Poll duration in minutes (e.g. 60 for 1 hour, 1440 for 24 hours)"
    )
    async def poll(self, interaction: discord.Interaction, question: str, options: str, duration: int = 60):
        ctx = InteractionContext(interaction)
        await ctx.defer()
        if not ctx.guild:
            return await ctx.send(embed=make_embed("This command must be run inside a server.", discord.Color.red()), ephemeral=True)

        opts = [o.strip() for o in options.split(",") if o.strip()]
        if len(opts) < 2 or len(opts) > 10:
            return await ctx.send(embed=make_embed("Please specify between 2 and 10 options separated by commas (`Option 1, Option 2, Option 3`).", discord.Color.red()), ephemeral=True)

        if duration < 1 or duration > 43200:
            duration = 60

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

    @poll.error
    async def poll_error(self, interaction: discord.Interaction, error):
        ctx = InteractionContext(interaction)
        if isinstance(error, (app_commands.AppCommandError, commands.MissingRequiredArgument)):
            await ctx.send(embed=make_embed("Usage: `/poll <question> <options> [duration_in_minutes]`", discord.Color.red()), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(PollCommand(bot))
