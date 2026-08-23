import discord
from discord.ext import commands
from Components.Commands._utils import make_embed

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
                return await ctx.send(embed=make_embed("Please specify a voice channel or join one yourself (`-connect #channel`).", discord.Color.red()), ephemeral=True)

        try:
            # If the bot is already connected somewhere in this server
            if ctx.guild.voice_client:
                if ctx.guild.voice_client.channel.id == target_channel.id:
                    return await ctx.send(embed=make_embed(f"I am already connected to {target_channel.mention}.", discord.Color.red()), ephemeral=True)
                
                # Move to the new channel
                await ctx.guild.voice_client.move_to(target_channel)
                return await ctx.send(embed=make_embed(f"Moved to {target_channel.mention}."))
            else:
                # Connect to the channel
                await target_channel.connect()
                return await ctx.send(embed=make_embed(f"Successfully joined {target_channel.mention} and will stay here until disconnected.", discord.Color.green()))
        except discord.Forbidden:
            return await ctx.send(embed=make_embed("I do not have permission to join that voice channel.", discord.Color.red()), ephemeral=True)
        except Exception as e:
            return await ctx.send(embed=make_embed(f"Error joining voice channel: {e}", discord.Color.red()), ephemeral=True)

    @commands.hybrid_command(name="disconnect", aliases=["leave", "dc"], description="Makes the bot leave the voice channel.")
    @commands.has_permissions(manage_channels=True)
    async def disconnect_cmd(self, ctx: commands.Context):
        await ctx.defer()
        if ctx.guild.voice_client:
            try:
                await ctx.guild.voice_client.disconnect()
                await ctx.send(embed=make_embed("Successfully disconnected from the voice channel.", discord.Color.green()))
            except Exception as e:
                await ctx.send(embed=make_embed(f"Error disconnecting: {e}", discord.Color.red()), ephemeral=True)
        else:
            await ctx.send(embed=make_embed("I am not currently in a voice channel on this server.", discord.Color.red()), ephemeral=True)

    @connect_cmd.error
    async def connect_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send(embed=make_embed("You need Manage Channels permission to use this command.", discord.Color.red()), ephemeral=True)
        elif isinstance(error, commands.BadArgument):
            await ctx.send(embed=make_embed("Could not find that voice channel. Please tag it correctly or provide its ID.", discord.Color.red()), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

    @disconnect_cmd.error
    async def disconnect_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send(embed=make_embed("You need Manage Channels permission to use this command.", discord.Color.red()), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(BotVCCommand(bot))