import discord
from discord.ext import commands
from .gemini import GeminiChatbot

async def setup(bot: commands.Bot):
    await bot.add_cog(GeminiChatbot(bot))
