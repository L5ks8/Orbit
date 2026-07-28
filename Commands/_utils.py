import discord
from discord.ext import commands

def format_usage(command: str, *args: str) -> str:
    """Build a short command usage string in a consistent format."""
    usage = f"Usage: {command}"
    if args:
        usage += " " + " ".join(args)
    return usage

class MemberOrIDConverter(commands.Converter):
    """Resolve a guild member or user from a mention, name, or ID."""
    async def convert(self, ctx: commands.Context, argument: str) -> discord.Member | discord.User:
        if isinstance(argument, (discord.Member, discord.User)):
            return argument
        arg_str = str(argument).strip()
        try:
            return await commands.MemberConverter().convert(ctx, arg_str)
        except commands.BadArgument:
            pass

        try:
            return await commands.UserConverter().convert(ctx, arg_str)
        except commands.BadArgument:
            pass

        cleaned = arg_str.strip("<@!>")
        if cleaned.isdigit():
            try:
                user = await ctx.bot.fetch_user(int(cleaned))
                if user:
                    if ctx.guild:
                        member = ctx.guild.get_member(user.id)
                        if member:
                            return member
                    return user
            except Exception:
                pass

        raise commands.BadArgument(f"Could not find member or user '{argument}'. Please provide a valid @mention or user ID.")

class UserOrIDConverter(commands.Converter):
    """Resolve a user from a mention, name, or ID."""
    async def convert(self, ctx: commands.Context, argument: str) -> discord.User:
        if isinstance(argument, discord.User):
            return argument
        arg_str = str(argument).strip()
        try:
            return await commands.UserConverter().convert(ctx, arg_str)
        except commands.BadArgument:
            pass

        cleaned = arg_str.strip("<@!>")
        if cleaned.isdigit():
            try:
                user = await ctx.bot.fetch_user(int(cleaned))
                if user:
                    return user
            except Exception:
                pass

        raise commands.BadArgument(f"Could not find user '{argument}'. Please provide a valid @mention or user ID.")

async def send_moderation_dm(user: discord.Member | discord.User, guild_name: str, action: str, reason: str, duration: str = None):
    try:
        embed = discord.Embed(
            description=f"You were {action} in {guild_name}{f' for {duration}' if duration else ''}. | {reason}",
            color=discord.Color.red()
        )
        await user.send(embed=embed)
    except Exception:
        pass

