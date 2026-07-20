import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow

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

        container_items = [
            TextDisplay(content=f"### Community Poll Closed (ID: `{poll_id}`)\n**Question:** {question}"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Status:** Voting session has ended. Results locked.\n**Closed By:** {author_mention}")
        ]

        view = LayoutView()
        view.add_item(Container(*container_items))
        return {"view": view}

    poll_id = kwargs.get("poll_id", "")
    question = kwargs.get("question", "Unknown")
    author_mention = kwargs.get("author_mention", "Unknown")
    duration_minutes = kwargs.get("duration_minutes", 60)
    options = kwargs.get("options", [])
    votes_dict = kwargs.get("votes_dict", {})
    total_votes = kwargs.get("total_votes", 0)
    components = kwargs.get("components", [])

    dur_str = f"{duration_minutes}m ({round(duration_minutes/60, 1)}h)" if duration_minutes >= 60 else f"{duration_minutes}m"
    header = f"Community Poll\n**Question:** {question}\n**Author:** {author_mention} | **Duration:** `{dur_str}` | **Total Votes:** `{total_votes}`"

    container_items = [
        TextDisplay(content=header),
        Separator(spacing=discord.SeparatorSpacing.small)
    ]

    has_section = hasattr(discord.ui, "Section")
    for idx, opt in enumerate(options, 1):
        v_count = len(votes_dict.get(opt, set()))
        pct = int(round((v_count / total_votes) * 100)) if total_votes > 0 else 0
        bar = make_bar(pct, length=12)
        opt_text = f"**`#{idx}` {opt}**\n`{bar}` **`{pct}%`** (`{v_count} votes`)"
        
        btn = None
        if len(components) >= idx:
            btn = components[idx-1]
            
        if has_section and btn:
            try:
                container_items.append(discord.ui.Section(TextDisplay(content=opt_text), accessory=btn))
            except Exception:
                container_items.extend([TextDisplay(content=opt_text), ActionRow(btn)])
        else:
            if btn:
                container_items.extend([TextDisplay(content=opt_text), ActionRow(btn)])
            else:
                container_items.append(TextDisplay(content=opt_text))

    container_items.extend([
        Separator(spacing=discord.SeparatorSpacing.small),
        TextDisplay(content=f"**Poll ID:** `{poll_id}`")
    ])

    view = LayoutView(timeout=None)
    view.add_item(Container(*container_items))
    return {"view": view}
