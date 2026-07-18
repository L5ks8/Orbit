import discord
from discord.ext import commands

def format_usage(command: str, *args: str) -> str:
    """Build a short command usage string in a consistent format."""
    usage = f"Usage: {command}"
    if args:
        usage += " " + " ".join(args)
    return usage

class MemberOrIDConverter(commands.Converter):
    """Resolve a guild member from a mention, name, or ID."""
    async def convert(self, ctx: commands.Context, argument: str) -> discord.Member:
        if isinstance(argument, discord.Member):
            return argument
        try:
            return await commands.MemberConverter().convert(ctx, str(argument))
        except commands.BadArgument:
            raise commands.BadArgument(f"Could not find member '{argument}'. Please provide a valid @mention or user ID.")

class UserOrIDConverter(commands.Converter):
    """Resolve a user from a mention, name, or ID."""
    async def convert(self, ctx: commands.Context, argument: str) -> discord.User:
        if isinstance(argument, discord.User):
            return argument
        try:
            return await commands.UserConverter().convert(ctx, str(argument))
        except commands.BadArgument:
            raise commands.BadArgument(f"Could not find user '{argument}'. Please provide a valid @mention or user ID.")

