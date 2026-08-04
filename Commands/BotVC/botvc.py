import discord
from discord.ext import commands

class BotVCCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="connect", aliases=["join"], description="Makes the bot join a voice channel.")
    @commands.has_permissions(manage_channels=True)
    async def connect_cmd(self, ctx: commands.Context, channel: discord.VoiceChannel = None):
        await ctx.defer()
        target_channel = channel
        
        # If no channel is specified, try to use the user's current voice channel
        if not target_channel:
            if ctx.author.voice and ctx.author.voice.channel:
                target_channel = ctx.author.voice.channel
            else:
                return await ctx.send("Please specify a voice channel or join one yourself (`-connect #channel`).", ephemeral=True)

        try:
            # If the bot is already connected somewhere in this server
            if ctx.guild.voice_client:
                if ctx.guild.voice_client.channel.id == target_channel.id:
                    return await ctx.send(f"I am already connected to {target_channel.mention}.", ephemeral=True)
                
                # Move to the new channel
                await ctx.guild.voice_client.move_to(target_channel)
                return await ctx.send(f"Moved to {target_channel.mention}.")
            else:
                # Connect to the channel
                await target_channel.connect()
                return await ctx.send(f"Successfully joined {target_channel.mention} and will stay here until disconnected.")
        except discord.Forbidden:
            return await ctx.send("I do not have permission to join that voice channel.", ephemeral=True)
        except Exception as e:
            return await ctx.send(f"Error joining voice channel: {e}", ephemeral=True)

    @commands.hybrid_command(name="disconnect", aliases=["leave", "dc"], description="Makes the bot leave the voice channel.")
    @commands.has_permissions(manage_channels=True)
    async def disconnect_cmd(self, ctx: commands.Context):
        await ctx.defer()
        if ctx.guild.voice_client:
            try:
                await ctx.guild.voice_client.disconnect()
                await ctx.send("Successfully disconnected from the voice channel.")
            except Exception as e:
                await ctx.send(f"Error disconnecting: {e}", ephemeral=True)
        else:
            await ctx.send("I am not currently in a voice channel on this server.", ephemeral=True)

    @connect_cmd.error
    async def connect_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need Manage Channels permission to use this command.", ephemeral=True)
        elif isinstance(error, commands.BadArgument):
            await ctx.send("Could not find that voice channel. Please tag it correctly or provide its ID.", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

    @disconnect_cmd.error
    async def disconnect_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need Manage Channels permission to use this command.", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(BotVCCommand(bot))
