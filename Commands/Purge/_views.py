import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator

class PurgeSuccessLayout(LayoutView):
    def __init__(self, count: int, channel: discord.TextChannel, author: discord.Member, filter_user: discord.Member | None = None, is_all: bool = False):
        super().__init__()
        filter_text = f"\n**Filter:** Messages from {filter_user.mention}" if filter_user else ""
        title = "Channel Purged Completely" if is_all else "Messages Purged"
        self.container = Container(
            TextDisplay(content=f"### {title}\n**Total Messages Deleted:** `{count}`"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Channel:** {channel.mention}\n**Moderator:** {author.mention}{filter_text}")
        )
        self.add_item(self.container)
