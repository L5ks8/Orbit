import discord
from discord.ext import commands
from discord import app_commands
from Commands.AutoResponder._storage import add_response, remove_response, load_responses, get_response_entry
from Commands._utils import format_usage

class AutoResponderCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    def _resolve_channel_mentions(self, text: str, guild: discord.Guild) -> str:
        """Replace #channel-name with <#id> if the channel exists in the guild."""
        import re
        def replace_match(m):
            name_or_id = m.group(1)
            if name_or_id.isdigit():
                return f"<#{name_or_id}>"
            name = name_or_id.lower()
            ch = discord.utils.find(lambda c: c.name.lower() == name, guild.text_channels)
            return f"<#{ch.id}>" if ch else m.group(0)
        return re.sub(r'(?<!<)#([\w-]+)(?!>)', replace_match, text)

    @commands.hybrid_command(name="addreply", description="Adds an auto-response trigger and message.")
    @commands.has_permissions(manage_guild=True)
    @app_commands.describe(
        trigger="The exact word or phrase to trigger the response",
        response="The message the bot should reply with",
        channel="Optional channel to restrict this auto-response to",
        use_ai="Check if the trigger word context actually makes sense in the sentence"
    )
    async def addreply(self, ctx: commands.Context, channel: discord.TextChannel = None, trigger: str = None, *, response: str = None, use_ai: bool = False):
        if not trigger or not response:
            return await ctx.send(format_usage("-addreply", "[#channel]", "<trigger_word>", "<response_message>"), ephemeral=True)
        
        await ctx.defer()
        if not ctx.guild:
            return await ctx.send("This command must be run inside a server.", ephemeral=True)
        
        channel_id = channel.id if channel else None
        add_response(ctx.guild.id, trigger, response, channel_id, use_ai)
        
        chan_text = f"<#{channel.id}>" if channel else "All Channels"
        ai_text = "Enabled" if use_ai else "Disabled"
        await ctx.send(f"âœ… Successfully added auto-response!\n**Trigger:** `{trigger}`\n**Channel:** {chan_text}\n**AI Context Check:** {ai_text}\n**Response:** {response}")

    @commands.hybrid_command(name="delreply", aliases=["removereply"], description="Removes an auto-response.")
    @commands.has_permissions(manage_guild=True)
    @app_commands.describe(trigger="The trigger word or phrase to remove")
    async def delreply(self, ctx: commands.Context, *, trigger: str = None):
        if not trigger:
            return await ctx.send(format_usage("-delreply", "<trigger_word>"), ephemeral=True)
            
        await ctx.defer()
        if not ctx.guild:
            return await ctx.send("This command must be run inside a server.", ephemeral=True)
            
        success = remove_response(ctx.guild.id, trigger)
        if success:
            await ctx.send(f"âœ… Successfully removed auto-response for trigger: `{trigger}`")
        else:
            await ctx.send(f"âŒ Could not find an auto-response with trigger: `{trigger}`", ephemeral=True)

    @commands.hybrid_command(name="replies", aliases=["listreplies"], description="Lists all active auto-responses.")
    @commands.has_permissions(manage_guild=True)
    async def listreplies(self, ctx: commands.Context):
        await ctx.defer()
        if not ctx.guild:
            return await ctx.send("This command must be run inside a server.", ephemeral=True)
            
        data = load_responses(ctx.guild.id)
        if not data:
            return await ctx.send("This server has no auto-responses set up yet.", ephemeral=True)
            
        lines = []
        for trigger, entry in data.items():
            chan = f"<#{entry['channel_id']}>" if entry.get("channel_id") else "All Channels"
            ai = "Yes" if entry.get("use_ai") else "No"
            lines.append(f"**Trigger:** `{trigger}`\n**Channel:** {chan}\n**AI Check:** {ai}\n**Response:** {entry['response']}")
            
        content = "### Active Auto-Responses\n" + "\n\n".join(lines)
        if len(content) > 2000:
            content = content[:1990] + "..."
            
        await ctx.send(content)

    @commands.Cog.listener()
    async def on_message(self, message: discord.Message):
        if message.author.bot or not message.guild:
            return
            
        content = message.content.lower().strip()
        if not content:
            return

        def can_respond(entry_data: dict) -> bool:
            cid = entry_data.get("channel_id")
            return not cid or str(cid) == str(message.channel.id)
            
        async def check_ai_context(trigger: str, text: str, response: str) -> bool:
            try:
                from g4f.client import AsyncClient
                import g4f
                providers = [
                    getattr(g4f.Provider, "Blackbox", None),
                    getattr(g4f.Provider, "DDG", None),
                    getattr(g4f.Provider, "DuckDuckGo", None),
                    getattr(g4f.Provider, "FreeGpt", None),
                    getattr(g4f.Provider, "ChatGptEs", None),
                ]
                valid_providers = [p for p in providers if p is not None]
                if hasattr(g4f.Provider, "RetryProvider") and valid_providers:
                    client = AsyncClient(provider=g4f.Provider.RetryProvider(valid_providers))
                else:
                    client = AsyncClient()
                prompt = (f"You are a strict context checker. The user's message contains the trigger word '{trigger}'. "
                          f"The bot is configured to reply with: '{response}'. "
                          f"Based on this reply, does the context of the user's message match the intended context for the trigger? "
                          f"User's Message: '{text}'. "
                          f"Answer only with YES or NO.")
                response = await client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "user", "content": prompt}],
                )
                answer = response.choices[0].message.content.strip().lower()
                return "yes" in answer
            except Exception as e:
                print(f"[AutoResponder AI] Error: {e}")
                return True # Fallback to True if AI fails

        entry = get_response_entry(message.guild.id, content)
        if entry and can_respond(entry):
            if entry.get("use_ai"):
                if not await check_ai_context(content, message.content, entry["response"]):
                    return
            try:
                response_text = self._resolve_channel_mentions(entry["response"], message.guild)
                return await message.reply(content=response_text, mention_author=False)
            except Exception:
                pass

        words = content.split()
        data = load_responses(message.guild.id)
        for trigger, entry_data in data.items():
            if trigger in words and can_respond(entry_data):
                if entry_data.get("use_ai"):
                    if not await check_ai_context(trigger, message.content, entry_data["response"]):
                        continue
                try:
                    response_text = self._resolve_channel_mentions(entry_data["response"], message.guild)
                    await message.reply(content=response_text, mention_author=False)
                except Exception:
                    pass
                break 

async def setup(bot: commands.Bot):
    await bot.add_cog(AutoResponderCommand(bot))

