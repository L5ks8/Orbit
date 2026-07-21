import os
import json
import re
import asyncio
import random
import discord
from discord.ext import commands
from g4f.client import AsyncClient

class GeminiChatbot(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.client = AsyncClient()
        self.memory_resets = {}

    @commands.group(invoke_without_command=True)
    async def memory(self, ctx):
        await ctx.reply("Use `-memory reset` to clear the bot's memory in this channel.", mention_author=False)

    @memory.command(name="reset")
    async def memory_reset(self, ctx):
        self.memory_resets[ctx.channel.id] = ctx.message.created_at
        await ctx.reply("My memory for this channel has been successfully cleared! I don't remember anything from before.", mention_author=False)

    @commands.Cog.listener()
    async def on_message(self, message: discord.Message):
        if message.author.bot:
            return

        # Ignore if it's a command being executed (like -memory reset)
        ctx = await self.bot.get_context(message)
        if ctx.valid and ctx.command is not None:
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
                # Fetch context (last 10 messages, but only after the last reset)
                reset_time = self.memory_resets.get(message.channel.id)
                messages = [m async for m in message.channel.history(limit=10, before=message, after=reset_time)]
                messages.reverse()

                server_info = ""
                if message.guild:
                    server_info = (
                        f"Server Name: {message.guild.name}\n"
                        f"Member Count: {message.guild.member_count}\n"
                        f"Roles Count: {len(message.guild.roles)}\n"
                        f"Channels Count: {len(message.guild.channels)}\n"
                        f"Owner: {message.guild.owner.display_name if message.guild.owner else 'Unknown'}\n"
                    )

                prefix_cmds = []
                for cmd in self.bot.commands:
                    # Ignore some internal or hidden commands if needed, but we just list them all
                    prefix_cmds.append(f"{cmd.name}")
                prefix_cmds_str = ", ".join(prefix_cmds)

                system_prompt = (
                    "You are Orbit, an intelligent, direct, and efficient Discord bot. "
                    "Your tone is cool, concise, and somewhat sarcastic. You are not overly friendly, soft, or cutesy. "
                    "You are talking with users in a Discord server. "
                    "Your purpose is to answer questions about the server and about your own capabilities. "
                    "You CANNOT execute commands yourself. If a user wants to do something, just tell them the correct command to use. "
                    "Here is information about the current server:\n"
                    f"{server_info}\n"
                    "Here are your main slash command categories and features:\n"
                    "- Moderation: /ban, /kick, /mute, /timeout, /warn, /purge\n"
                    "- Roles: /role add, /role remove, /reactionrole create, /joinrole\n"
                    "- Tickets: /ticket setup to create a ticket system\n"
                    "- Verification: /verify setup to create a captcha/button verification system\n"
                    "- Levelling: /level, /rank to check activity ranks\n"
                    "- Voice: /voice lock, /voice limit, /jointocreate (creates temporary voice channels)\n"
                    "- Utilities: /poll, /giveaway, /reminder, /afk\n"
                    "- Memory: -memory reset (clears your chat history in a channel)\n\n"
                    "Here are all your available prefix commands:\n"
                    f"{prefix_cmds_str}\n\n"
                    "Answer user questions accurately based on this information."
                )

                prompt = f"{system_prompt}\n\nHere is the chat history:\n"
                
                for msg in messages:
                    author_name = msg.author.display_name
                    content = msg.clean_content
                    prompt += f"{author_name}: {content}\n"

                # Use message.content instead of clean_content to preserve pings
                prompt += f"\n{message.author.display_name}: {message.content}\n"
                prompt += "Orbit:"

                response = await self.client.chat.completions.create(
                    model='gpt-4o',
                    messages=[{'role': 'user', 'content': prompt}]
                )
                
                text_response = response.choices[0].message.content
                            
                if text_response:
                    await self._send_chunked(message, text_response)
                else:
                    await message.reply("I'm sorry, I couldn't generate a response.")
                    
            except Exception as e:
                await message.reply(f"An error occurred while communicating with Orbit: `{e}`")
                print(f"AI Error: {e}")

    async def _send_chunked(self, message: discord.Message, text: str):
        chunks = [text[i:i+1950] for i in range(0, len(text), 1950)]
        reply_to = message
        for chunk in chunks:
            reply_to = await reply_to.reply(chunk)

async def setup(bot: commands.Bot):
    await bot.add_cog(GeminiChatbot(bot))
