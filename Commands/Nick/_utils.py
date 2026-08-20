import discord
from discord.ext import commands


from Commands.Whitelist._storage import is_whitelisted
from Commands._utils import make_embed

async def perform_nick_edit(ctx: commands.Context, target: discord.Member, nickname: str | None):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send(embed=make_embed("This command must be run inside a server.", discord.Color.red()), ephemeral=True)

    if target.id != ctx.author.id:
        if is_whitelisted(ctx.guild.id, target.id):
            return await ctx.send(embed=make_embed("This user is on the global moderation whitelist (`Immune to Nickname Change`).", discord.Color.red()), ephemeral=True)
        if target.top_role >= ctx.author.top_role and ctx.author != ctx.guild.owner:
            return await ctx.send(embed=make_embed("You cannot change the nickname of a user with an equal or higher role than yours.", discord.Color.red()), ephemeral=True)

    if target.top_role >= ctx.guild.me.top_role and target != ctx.guild.me:
        return await ctx.send(embed=make_embed("I cannot change this user's nickname because their role is higher or equal to mine.", discord.Color.red()), ephemeral=True)
    if target == ctx.guild.owner:
        return await ctx.send(embed=make_embed("I cannot change the Server Owner's nickname due to Discord role hierarchy constraints.", discord.Color.red()), ephemeral=True)

    if nickname and len(nickname) > 32:
        return await ctx.send(embed=make_embed("Nicknames cannot exceed 32 characters in length.", discord.Color.red()), ephemeral=True)

    old_nick = target.nick
    try:
        await target.edit(nick=nickname, reason=f"Nickname changed by {ctx.author}")
        old_display = old_nick if old_nick else f"{target.name} (Default)"
        new_display = nickname if nickname else f"{target.name} (Reset to Default)"

        embed = discord.Embed(
            title="Nickname Updated",
            description=f"**Target:** {target.mention} (`{target.id}`)\n\n**Old Nickname:** `{old_display}`\n**New Nickname:** `{new_display}`\n**Changed by:** {ctx.author.mention}",
            color=discord.Color.green()
        )
        await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())
    except discord.Forbidden:
        await ctx.send(embed=make_embed("I do not have sufficient permissions (`Manage Nicknames`) to modify this user's nickname.", discord.Color.red()), ephemeral=True)
    except Exception as e:
        await ctx.send(embed=make_embed(f"An error occurred while setting nickname: {e}", discord.Color.red()), ephemeral=True)
