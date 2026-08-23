import discord
from discord.ext import commands
from Components.Commands._utils import make_embed


class SayCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="say", description="Makes the bot send a custom message into a channel.")
    @commands.has_permissions(manage_messages=True)
    async def say(self, ctx: commands.Context, message: str, channel: discord.TextChannel = None):
        await ctx.defer(ephemeral=True)
        target_channel = channel or ctx.channel
        if not isinstance(target_channel, discord.TextChannel):
            return await ctx.send(embed=make_embed("Please specify a valid text channel.", discord.Color.red()), ephemeral=True)

        try:
            await target_channel.send(message)
            await ctx.send(embed=make_embed(f"Message sent successfully to {target_channel.mention}.", discord.Color.green()), ephemeral=True)
        except discord.Forbidden:
            await ctx.send(embed=make_embed("I do not have permissions to send messages inside that channel.", discord.Color.red()), ephemeral=True)
        except Exception as e:
            await ctx.send(embed=make_embed(f"Error sending message: {e}", discord.Color.red()), ephemeral=True)

    @say.error
    async def say_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send(embed=make_embed("You need Manage Messages permission to use the say command.", discord.Color.red()), ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send(embed=make_embed("Usage: -say <message> [#channel]", discord.Color.red()), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(SayCommand(bot))
