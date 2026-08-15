import os
import io
import asyncio
import tempfile
import discord
from discord.ext import commands

try:
    import edge_tts
    HAS_EDGE_TTS = True
except ImportError:
    HAS_EDGE_TTS = False

from Commands.Voice.voice import voice_group

VOICE = "de-DE-ConradNeural"

async def _text_to_speech(text: str) -> bytes | None:
    if not HAS_EDGE_TTS:
        return None
    communicate = edge_tts.Communicate(text, VOICE)
    audio_buffer = io.BytesIO()
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_buffer.write(chunk["data"])
    audio_buffer.seek(0)
    if audio_buffer.getbuffer().nbytes == 0:
        return None
    return audio_buffer.read()

@voice_group.command(name="say", description="Bot speaks your text in the voice channel.")
async def vc_say_cmd(ctx: commands.Context, *, text: str):
    voice_client = ctx.guild.voice_client if ctx.guild else None

    if not voice_client or not voice_client.is_connected():
        return await ctx.send(embed=make_embed("I'm not in a voice channel. Use `/connect` first.", discord.Color.red()), ephemeral=True)

    if not HAS_EDGE_TTS:
        return await ctx.send(embed=make_embed("TTS is not available.", discord.Color.red()), ephemeral=True)

    if len(text) > 500:
        return await ctx.send(embed=make_embed("Text is too long. Maximum 500 characters.", discord.Color.red()), ephemeral=True)

    await ctx.defer()

    try:
        audio_data = await _text_to_speech(text)
    except Exception as e:
        return await ctx.send(embed=make_embed(f"TTS failed: `{e}`", discord.Color.red()), ephemeral=True)

    if not audio_data:
        return await ctx.send(embed=make_embed("Could not generate audio.", discord.Color.red()), ephemeral=True)

    tmp_path = None
    try:
        if voice_client.is_playing():
            voice_client.stop()
            await asyncio.sleep(0.3)

        fd, tmp_path = tempfile.mkstemp(suffix=".mp3")
        os.write(fd, audio_data)
        os.close(fd)

        done_event = asyncio.Event()

        def after_playing(error):
            if error:
                print(f"[say] Playback error: {error}")
            ctx.bot.loop.call_soon_threadsafe(done_event.set)

        source = discord.FFmpegPCMAudio(tmp_path)
        voice_client.play(source, after=after_playing)

        embed = discord.Embed(
            description=f" **{text}**",
            color=discord.Color.green(),
        )
        embed.set_footer(text=f"{ctx.author.display_name} • {voice_client.channel.name}")
        await ctx.send(embed=embed)

        try:
            await asyncio.wait_for(done_event.wait(), timeout=120.0)
        except asyncio.TimeoutError:
            pass

    finally:
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except OSError:
                pass

@vc_say_cmd.error
async def vc_say_error(ctx: commands.Context, error):
    if isinstance(error, commands.MissingRequiredArgument):
        await ctx.send(embed=make_embed("Use: `-voice say <text>` or `-vc say <text>`", discord.Color.red()), ephemeral=True)
    else:
        await ctx.send(embed=make_embed(f"Error: {error}", discord.Color.red()), ephemeral=True)

async def setup(bot: commands.Bot):
    from Commands.Voice.voice import voice_group
from Commands._utils import make_embed
    if "voice" not in bot.all_commands:
        bot.add_command(voice_group)