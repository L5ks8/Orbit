import discord
from discord.ext import commands
from discord import app_commands
from Commands.AutoResponder._storage import add_response, remove_response, load_responses, get_response
from Commands._utils import format_usage

class AutoResponderCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="addreply", description="Adds an auto-response trigger and message.")
    @commands.has_permissions(manage_guild=True)
    @app_commands.describe(
        trigger="The exact word or phrase to trigger the response",
        response="The message the bot should reply with"
    )
    async def addreply(self, ctx: commands.Context, trigger: str = None, *, response: str = None):
        if not trigger or not response:
            return await ctx.send(format_usage("-addreply", "<trigger_word>", "<response_message>"), ephemeral=True)
        
        await ctx.defer()
        if not ctx.guild:
            return await ctx.send("This command must be run inside a server.", ephemeral=True)
        
        add_response(ctx.guild.id, trigger, response)
        await ctx.send(f"✅ Successfully added auto-response!\n**Trigger:** `{trigger}`\n**Response:** {response}")

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
        for trigger, response in data.items():
            lines.append(f"**Trigger:** `{trigger}`\n**Response:** {response}")
            
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
            
        # Check if the message exactly matches a trigger
        response = get_response(message.guild.id, content)
        if response:
            try:
                await message.reply(content=response, mention_author=False)
            except Exception:
                pass
                
        # Also check if a trigger is an exact word inside the message
        # We only want to do this if the exact match failed to avoid double responses
        if not response:
            words = content.split()
            data = load_responses(message.guild.id)
            for trigger, res in data.items():
                if trigger in words:
                    try:
                        await message.reply(content=res, mention_author=False)
                    except Exception:
                        pass
                    break # Only reply to the first matching trigger to avoid spam

async def setup(bot: commands.Bot):
    await bot.add_cog(AutoResponderCommand(bot))
