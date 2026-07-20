import discord
from discord.ext import commands


class SayCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="say", description="Makes the bot send a custom message into a channel.")
    @commands.has_permissions(manage_messages=True)
    async def say(self, ctx: commands.Context, message: str, channel: discord.TextChannel = None):
        await ctx.defer(ephemeral=True)
        target_channel = channel or ctx.channel
        if not isinstance(target_channel, discord.TextChannel):
            return await ctx.send("Please specify a valid text channel.", ephemeral=True)

        try:
            await target_channel.send(message)
            await ctx.send(f"Message sent successfully to {target_channel.mention}.", ephemeral=True)
        except discord.Forbidden:
            await ctx.send("I do not have permissions to send messages inside that channel.", ephemeral=True)
        except Exception as e:
            await ctx.send(f"Error sending message: {e}", ephemeral=True)

    @say.error
    async def say_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need Manage Messages permission to use the say command.", ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send("Usage: -say <message> [#channel]", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(SayCommand(bot))

