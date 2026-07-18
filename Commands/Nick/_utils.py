utf-8import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Commands.Whitelist._storage import is_whitelisted

class NickSuccessLayout(LayoutView):
    def __init__(self, target: discord.Member, old_nick: str, new_nick: str, author: discord.Member):
        super().__init__()
        old_display = old_nick if old_nick else f"{target.name} (Default)"
        new_display = new_nick if new_nick else f"{target.name} (Reset to Default)"

        self.container = Container(
            TextDisplay(content=f"### Nickname Updated\n**Target:** {target.mention} (`{target.id}`)"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Old Nickname:** `{old_display}`\n**New Nickname:** `{new_display}`\n**Changed by:** {author.mention}")
        )
        self.add_item(self.container)

async def perform_nick_edit(ctx: commands.Context, target: discord.Member, nickname: str | None):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send("This command must be run inside a server.", ephemeral=True)

    if target.id != ctx.author.id:
        if is_whitelisted(ctx.guild.id, target.id):
            return await ctx.send("This user is on the global moderation whitelist (`Immune to Nickname Change`).", ephemeral=True)
        if target.top_role >= ctx.author.top_role and ctx.author != ctx.guild.owner:
            return await ctx.send("You cannot change the nickname of a user with an equal or higher role than yours.", ephemeral=True)

    if target.top_role >= ctx.guild.me.top_role and target != ctx.guild.me:
        return await ctx.send("I cannot change this user's nickname because their role is higher or equal to mine.", ephemeral=True)
    if target == ctx.guild.owner:
        return await ctx.send("I cannot change the Server Owner's nickname due to Discord role hierarchy constraints.", ephemeral=True)

    if nickname and len(nickname) > 32:
        return await ctx.send("Nicknames cannot exceed 32 characters in length.", ephemeral=True)

    old_nick = target.nick
    try:
        await target.edit(nick=nickname, reason=f"Nickname changed/reset by {ctx.author}")
        view = NickSuccessLayout(target, old_nick, nickname, ctx.author)
        await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())
    except discord.Forbidden:
        await ctx.send("I do not have sufficient permissions (`Manage Nicknames`) to modify this user's nickname.", ephemeral=True)
    except Exception as e:
        await ctx.send(f"An error occurred while setting nickname: {e}", ephemeral=True)
