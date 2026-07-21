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

                system_prompt = (
                    "You are Orbit, an intelligent, direct, and efficient Discord bot. "
                    "Your tone is cool, concise, and somewhat sarcastic. You are not overly friendly, soft, or cutesy. "
                    "You are talking with users in a Discord server. "
                    "You are an all-in-one Discord bot. If users ask you how to do something on the server or what your commands are, "
                    "you should confidently answer based on your capabilities. "
                    "Here are your main command categories and features:\n"
                    "- Moderation: /ban, /kick, /mute, /timeout, /warn, /purge\n"
                    "- Roles: /role add, /role remove, /reactionrole create, /joinrole\n"
                    "- Tickets: /ticket setup to create a ticket system\n"
                    "- Verification: /verify setup to create a captcha/button verification system\n"
                    "- Levelling: /level, /rank to check activity ranks\n"
                    "- Voice: /voice lock, /voice limit, /jointocreate (creates temporary voice channels)\n"
                    "- Utilities: /poll, /giveaway, /reminder, /afk\n"
                    "- Memory: -memory reset (clears your chat history in a channel)\n\n"
                    "You also have the ability to execute certain actions when commanded by the user. "
                    "Available actions:\n"
                    "1. 'dm_user' - Sends a DM to a user. (Parameters: 'target' as mention, 'message' as text)\n"
                    "2. 'spam_ping' - Pings a user multiple times. (Parameters: 'target' as mention, 'count' max 10)\n"
                    "To execute an action, your response MUST contain a JSON block AT THE VERY END, e.g.:\n"
                    "```json\n"
                    "{\n"
                    '  "action": "spam_ping",\n'
                    '  "target": "<@123456789>",\n'
                    '  "count": 5,\n'
                    '  "message": "optional"\n'
                    "}\n"
                    "```\n"
                    "Replace <@123456789> with the actual ping the user provides. "
                    "Only execute these actions if the user explicitly asks you to!"
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
                    # Extract JSON block
                    json_match = re.search(r'```json\s*(\{.*?\})\s*```', text_response, re.DOTALL)
                    action_data = None
                    if json_match:
                        try:
                            action_data = json.loads(json_match.group(1))
                            text_response = text_response[:json_match.start()].strip()
                        except json.JSONDecodeError:
                            pass

                    # Send text response
                    if text_response:
                        await self._send_chunked(message, text_response)

                    # Execute action
                    if action_data:
                        await self._execute_action(message, action_data)

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

    async def _execute_action(self, message: discord.Message, action_data: dict):
        action = action_data.get("action")
        target_str = action_data.get("target", "")
        
        # Check permissions
        if not (message.author.guild_permissions.administrator or message.author.guild_permissions.manage_guild):
            await message.channel.send(f"{message.author.mention} Du hast keine Berechtigung f├╝r diese Aktion!")
            return

        # Extract user ID
        user_id_match = re.search(r'<@!?(\d+)>', target_str)
        if not user_id_match:
            await message.channel.send("Fehler: Konnte den Ziel-User nicht finden.")
            return
            
        user_id = int(user_id_match.group(1))
        
        try:
            target_member = message.guild.get_member(user_id) or await message.guild.fetch_member(user_id)
        except discord.NotFound:
            target_member = None

        if not target_member:
            await message.channel.send("Fehler: User nicht im Server gefunden.")
            return

        if action == "dm_user":
            msg_content = action_data.get("message", "Hallo!")
            try:
                await target_member.send(msg_content)
                await message.channel.send(f"Ô£à DM an {target_member.mention} gesendet.")
            except discord.Forbidden:
                await message.channel.send(f"ÔØî Konnte keine DM an {target_member.mention} senden (DMs deaktiviert?).")
                
        elif action == "spam_ping":
            count = min(action_data.get("count", 1), 10)
            await message.channel.send(f"Spam-Ping gestartet f├╝r {target_member.mention} ({count} mal)...")
            for _ in range(count):
                await message.channel.send(target_member.mention)
                await asyncio.sleep(1)

async def setup(bot: commands.Bot):
    await bot.add_cog(GeminiChatbot(bot))
