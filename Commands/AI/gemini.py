import os
import discord
from discord.ext import commands
import aiohttp

class GeminiChatbot(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.model_name = "gemini-3.5-flash"

    @commands.Cog.listener()
    async def on_message(self, message: discord.Message):
        if message.author.bot or not self.api_key:
            return

        # Check if the bot is mentioned or if it's a reply to the bot
        is_mentioned = self.bot.user in message.mentions
        is_reply_to_bot = False
        
        if message.reference and message.reference.resolved:
            if isinstance(message.reference.resolved, discord.Message):
                if message.reference.resolved.author.id == self.bot.user.id:
                    is_reply_to_bot = True

        if not (is_mentioned or is_reply_to_bot):
            return

        async with message.channel.typing():
            try:
                # Fetch context (last 10 messages)
                messages = [m async for m in message.channel.history(limit=10, before=message)]
                messages.reverse()

                prompt = "You are a helpful and friendly Discord bot named Orbit. "
                prompt += "You are talking in a Discord server. Here is the recent conversation history:\n\n"
                
                for msg in messages:
                    author_name = msg.author.display_name
                    content = msg.clean_content
                    prompt += f"{author_name}: {content}\n"

                prompt += f"\n{message.author.display_name}: {message.clean_content}\n"
                prompt += "Orbit:"

                url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:generateContent?key={self.api_key}"
                headers = {'Content-Type': 'application/json'}
                payload = {
                    "contents": [{"parts": [{"text": prompt}]}]
                }
                
                async with aiohttp.ClientSession() as session:
                    async with session.post(url, headers=headers, json=payload) as resp:
                        if resp.status != 200:
                            error_text = await resp.text()
                            raise Exception(f"HTTP {resp.status}: {error_text}")
                            
                        data = await resp.json()
                        
                        try:
                            text_response = data['candidates'][0]['content']['parts'][0]['text']
                        except (KeyError, IndexError):
                            text_response = None
                            
                if text_response:
                    await self._send_chunked(message, text_response)
                else:
                    await message.reply("I'm sorry, my safety filters prevented me from responding to that or the response was empty.")
                    
            except Exception as e:
                await message.reply(f"An error occurred while communicating with Orbit: `{e}`")
                print(f"Gemini API Error: {e}")

    async def _send_chunked(self, message: discord.Message, text: str):
        chunks = [text[i:i+1950] for i in range(0, len(text), 1950)]
        reply_to = message
        for chunk in chunks:
            reply_to = await reply_to.reply(chunk)

async def setup(bot: commands.Bot):
    await bot.add_cog(GeminiChatbot(bot))
