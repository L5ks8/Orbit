import discord
from discord.ext import commands
from discord import app_commands
from Commands.AutoResponder._storage import add_response, remove_response, load_responses, get_response_entry
from Commands._utils import format_usage

class AutoResponderCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="addreply", description="Adds an auto-response trigger and message.")
    @commands.has_permissions(manage_guild=True)
    @app_commands.describe(
        trigger="The exact word or phrase to trigger the response",
        response="The message the bot should reply with",
        channel="Optional channel to restrict this auto-response to"
    )
    async def addreply(self, ctx: commands.Context, channel: discord.TextChannel = None, trigger: str = None, *, response: str = None):
        if not trigger or not response:
            return await ctx.send(format_usage("-addreply", "[#channel]", "<trigger_word>", "<response_message>"), ephemeral=True)
        
        await ctx.defer()
        if not ctx.guild:
            return await ctx.send("This command must be run inside a server.", ephemeral=True)
        
        channel_id = channel.id if channel else None
        add_response(ctx.guild.id, trigger, response, channel_id)
        
        chan_text = f"<#{channel.id}>" if channel else "All Channels"
        await ctx.send(f"✅ Successfully added auto-response!\n**Trigger:** `{trigger}`\n**Channel:** {chan_text}\n**Response:** {response}")

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
            await ctx.send(f"✅ Successfully removed auto-response for trigger: `{trigger}`")
        else:
            await ctx.send(f"❌ Could not find an auto-response with trigger: `{trigger}`", ephemeral=True)

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
            lines.append(f"**Trigger:** `{trigger}`\n**Channel:** {chan}\n**Response:** {entry['response']}")
            
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
            
        # Helper to check if we can respond in this channel
        def can_respond(entry_data: dict) -> bool:
            cid = entry_data.get("channel_id")
            return cid is None or cid == message.channel.id

        # Check if the message exactly matches a trigger
        entry = get_response_entry(message.guild.id, content)
        if entry and can_respond(entry):
            try:
                return await message.reply(content=entry["response"], mention_author=False)
            except Exception:
                pass
                
        # Also check if a trigger is an exact word inside the message
        # We only want to do this if the exact match failed to avoid double responses
        words = content.split()
        data = load_responses(message.guild.id)
        for trigger, entry_data in data.items():
            if trigger in words and can_respond(entry_data):
                try:
                    await message.reply(content=entry_data["response"], mention_author=False)
                except Exception:
                    pass
                break # Only reply to the first matching trigger to avoid spam

async def setup(bot: commands.Bot):
    await bot.add_cog(AutoResponderCommand(bot))
