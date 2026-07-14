import discord
from discord.ext import commands


def format_usage(command: str, *args: str) -> str:
    """Build a short command usage string in a consistent format."""
    usage = f"Usage: {command}"
    if args:
        usage += " " + " ".join(args)
    return usage


class MemberOrIDConverter(commands.Converter):
    """Resolve a guild member from a raw Discord user ID only."""

    async def convert(self, ctx: commands.Context, argument: str) -> discord.Member:
        if isinstance(argument, discord.Member):
            return argument

        if not isinstance(ctx.guild, discord.Guild):
            raise commands.BadArgument("This command can only be used in a server.")

        argument_text = str(argument).strip() if argument is not None else ""
        if not argument_text.isdigit():
            raise commands.BadArgument("Please provide a user ID only. Mentions are not supported for this command.")

        member_id = int(argument_text)
        member = ctx.guild.get_member(member_id)
        if member is None:
            try:
                member = await ctx.guild.fetch_member(member_id)
            except discord.NotFound:
                member = None
        if member is not None:
            return member

        raise commands.BadArgument(f"Could not find a member with ID `{member_id}`.")


class UserOrIDConverter(commands.Converter):
    """Resolve a user from a raw Discord user ID only."""

    async def convert(self, ctx: commands.Context, argument: str) -> discord.User:
        if isinstance(argument, discord.User):
            return argument

        argument_text = str(argument).strip() if argument is not None else ""
        if not argument_text.isdigit():
            raise commands.BadArgument("Please provide a user ID only. Mentions are not supported for this command.")

        user_id = int(argument_text)
        user = ctx.bot.get_user(user_id)
        if user is None:
            try:
                user = await ctx.bot.fetch_user(user_id)
            except discord.NotFound:
                user = None
        if user is not None:
            return user

        raise commands.BadArgument(f"Could not find a user with ID `{user_id}`.")
