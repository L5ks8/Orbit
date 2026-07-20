import discord

def make_bar(pct: int, length: int = 15) -> str:
    filled = int(round((pct / 100.0) * length))
    filled = max(0, min(length, filled))
    empty = length - filled
    return "â–ˆ" * filled + "â–‘" * empty

def get_embed(msg_type: str, **kwargs):
    if msg_type == "closed":
        question = kwargs.get("question", "Unknown")
        poll_id = kwargs.get("poll_id", "")
        author_mention = kwargs.get("author_mention", "Unknown")

        embed = discord.Embed(
            title="Community Poll Closed",
            description=f"**Question:** {question}\n\n**Status:** Voting session has ended. Results locked.\n**Closed By:** {author_mention}",
            color=discord.Color.red()
        )
        embed.set_footer(text=f"Poll ID: {poll_id}")
        return {"embed": embed, "view": discord.ui.View()}
    
    poll_id = kwargs.get("poll_id", "")
    question = kwargs.get("question", "Unknown")
    author_mention = kwargs.get("author_mention", "Unknown")
    duration_minutes = kwargs.get("duration_minutes", 60)
    options = kwargs.get("options", [])
    votes_dict = kwargs.get("votes_dict", {})
    total_votes = kwargs.get("total_votes", 0)
    components = kwargs.get("components", [])

    dur_str = f"{duration_minutes}m ({round(duration_minutes/60, 1)}h)" if duration_minutes >= 60 else f"{duration_minutes}m"
    
    lines = []
    for idx, opt in enumerate(options, 1):
        v_count = len(votes_dict.get(opt, set()))
        pct = int(round((v_count / total_votes) * 100)) if total_votes > 0 else 0
        bar = make_bar(pct, length=12)
        lines.append(f"**`#{idx}` {opt}**\n`{bar}` **`{pct}%`** (`{v_count} votes`)")

    content_str = "\n\n".join(lines)
    
    embed = discord.Embed(
        title="Community Poll",
        description=f"**Question:** {question}\n**Author:** {author_mention} | **Duration:** `{dur_str}` | **Total Votes:** `{total_votes}`\n\n{content_str}",
        color=discord.Color.blue()
    )
    embed.set_footer(text=f"Poll ID: {poll_id}")

    view = discord.ui.View(timeout=None)
    for comp in components:
        view.add_item(comp)

    return {"embed": embed, "view": view}
