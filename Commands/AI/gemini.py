import os
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
        await ctx.reply("Use `-memory reset` to clear my memory in this channel.", mention_author=False)

    @memory.command(name="reset")
    async def memory_reset(self, ctx):
        self.memory_resets[ctx.channel.id] = ctx.message.created_at
        await ctx.reply("My memory for this channel has been successfully cleared! I won't remember anything said before this.", mention_author=False)

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

                import copy
                import re

                prompt = "You are a highly intelligent, direct, and helpful Discord bot named Orbit. "
                prompt += "Personality rules: Be concise and keep your answers short unless asked for details. "
                prompt += "Do NOT be sarcastic, dramatic, or edgy. Be strictly helpful and polite. "
                prompt += "ALWAYS follow the user's instructions regarding language (e.g. if they say 'speak English' or 'speak German') and formatting. "
                prompt += "You can execute bot commands if the user asks you to. "
                prompt += "Allowed commands: ping, help, mute, unmute, warn, checkwarns, timeout, untimeout, vmove, vmute, vunmute. "
                prompt += "To execute a command, MUST include the exact syntax `[EXECUTE: command @user reason]` anywhere in your response. "
                prompt += "For example: `[EXECUTE: warn <@123456789> spamming]` or `[EXECUTE: ping]`. Do not use code blocks for the EXECUTE tag.\n\n"
                
                prompt += "Here is the recent conversation history:\n\n"
                
                for msg in messages:
                    author_name = msg.author.display_name
                    content = msg.clean_content
                    # If the user mentioned someone, they might appear as @Name in clean_content. 
                    # But the AI needs their raw ID to execute commands.
                    # We will provide the raw content so the AI sees <@ID> instead of just @Name.
                    raw_content = msg.content
                    prompt += f"{author_name}: {raw_content}\n"

                prompt += f"\n{message.author.display_name}: {message.content}\n"
                prompt += "Orbit:"

                response = await self.client.chat.completions.create(
                    model='gpt-4o',
                    messages=[{'role': 'user', 'content': prompt}]
                )
                
                text_response = response.choices[0].message.content
                            
                if text_response:
                    # Parse Tool Calling
                    execute_match = re.search(r'\[EXECUTE:\s*([^\]]+)\]', text_response, re.IGNORECASE)
                    if execute_match:
                        cmd_string = execute_match.group(1).strip()
                        text_response = text_response.replace(execute_match.group(0), '').strip()
                        
                        if text_response:
                            await self._send_chunked(message, text_response)
                            
                        # Security Check
                        allowed_commands = ["ping", "help", "mute", "unmute", "warn", "checkwarns", "timeout", "untimeout", "vmove", "vmute", "vunmute"]
                        base_cmd = cmd_string.split(" ")[0].lower()
                        
                        if base_cmd in allowed_commands:
                            fake_msg = copy.copy(message)
                            # Prefix is globally '-' by default in Orbit
                            fake_msg.content = f"-{cmd_string}"
                            ctx = await self.bot.get_context(fake_msg)
                            if ctx.valid:
                                await self.bot.invoke(ctx)
                            else:
                                await message.reply(f"❌ Die KI hat versucht, den Befehl `{cmd_string}` auszuführen, aber dieser Befehl ist ungültig.", mention_author=False)
                        else:
                            await message.reply(f"⚠️ Die KI hat versucht, einen nicht autorisierten Befehl auszuführen: `{base_cmd}`", mention_author=False)
                    else:
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
