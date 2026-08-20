import discord
from discord.ext import commands
from discord import app_commands
from Commands.AutoResponder._storage import add_response, remove_response, load_responses, get_response_entry
from Commands._utils import format_usage, make_embed

class AutoResponderCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    def _resolve_channel_mentions(self, text: str, guild: discord.Guild) -> str:
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
            return await ctx.send(embed=make_embed(format_usage("-addreply", "[#channel]", "<trigger_word>", "<response_message>"), discord.Color.red()), ephemeral=True)
        
        await ctx.defer()
        if not ctx.guild:
            return await ctx.send(embed=make_embed("This command must be run inside a server.", discord.Color.red()), ephemeral=True)
        
        channel_id = channel.id if channel else None
        add_response(ctx.guild.id, trigger, response, channel_id, use_ai)
        
        chan_text = f"<#{channel.id}>" if channel else "All Channels"
        ai_text = "Enabled" if use_ai else "Disabled"
        await ctx.send(embed=make_embed(f"Successfully added auto-response!\n**Trigger:** `{trigger}`\n**Channel:** {chan_text}\n**AI Context Check:** {ai_text}\n**Response:** {response}", discord.Color.green()))

    @commands.hybrid_command(name="delreply", aliases=["removereply"], description="Removes an auto-response.")
    @commands.has_permissions(manage_guild=True)
    @app_commands.describe(trigger="The trigger word or phrase to remove")
    async def delreply(self, ctx: commands.Context, *, trigger: str = None):
        if not trigger:
            return await ctx.send(embed=make_embed(format_usage("-delreply", "<trigger_word>"), discord.Color.red()), ephemeral=True)
            
        await ctx.defer()
        if not ctx.guild:
            return await ctx.send(embed=make_embed("This command must be run inside a server.", discord.Color.red()), ephemeral=True)
            
        success = remove_response(ctx.guild.id, trigger)
        if success:
            await ctx.send(embed=make_embed(f"Successfully removed auto-response for trigger: `{trigger}`", discord.Color.green()))
        else:
            await ctx.send(embed=make_embed(f"Could not find an auto-response with trigger: `{trigger}`", discord.Color.red()), ephemeral=True)

    @commands.hybrid_command(name="replies", aliases=["listreplies"], description="Lists all active auto-responses.")
    @commands.has_permissions(manage_guild=True)
    async def listreplies(self, ctx: commands.Context):
        await ctx.defer()
        if not ctx.guild:
            return await ctx.send(embed=make_embed("This command must be run inside a server.", discord.Color.red()), ephemeral=True)
            
        data = load_responses(ctx.guild.id)
        if not data:
            return await ctx.send(embed=make_embed("This server has no auto-responses set up yet."), ephemeral=True)
            
        lines = []
        for trigger, entry in data.items():
            chan = f"<#{entry['channel_id']}>" if entry.get("channel_id") else "All Channels"
            ai = "Yes" if entry.get("use_ai") else "No"
            lines.append(f"**Trigger:** `{trigger}`\n**Channel:** {chan}\n**AI Check:** {ai}\n**Response:** {entry['response']}")
            
        content = "### Active Auto-Responses\n" + "\n\n".join(lines)
        if len(content) > 2000:
            content = content[:1990] + "..."
            
        await ctx.send(embed=make_embed(content))

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

            def detect_lang(words_to_check: list[str]) -> str:
                word_set = set(w.lower().strip(".,!?;:\"'()") for w in words_to_check)

                de_stops = {
                    "ich", "du", "er", "sie", "es", "wir", "ihr", "wie", "dein", "mein",
                    "sein", "ist", "und", "oder", "aber", "nicht", "das", "der", "die",
                    "den", "dem", "ein", "eine", "zu", "von", "mit", "auf", "für", "aus",
                    "über", "nach", "bei", "durch", "um", "an", "hat", "bin", "hab",
                    "heute", "morgen", "gestern", "auch", "noch", "schon", "nur", "dann",
                    "wenn", "weil", "dass", "kann", "will", "muss", "soll", "darf",
                    "habe", "hatte", "wurde", "werden", "haben", "waren", "sind",
                    "doch", "ja", "nein", "kein", "keine", "alles", "nichts", "hier",
                    "dort", "tag", "nacht", "guten", "gute", "gut", "schlecht", "sehr",
                    "viel", "immer", "bitte", "danke", "wo", "wer", "was", "warum",
                    "dieser", "diese", "dieses", "jetzt", "mal", "so", "da", "mir",
                    "dir", "ihm", "uns", "euch", "ihnen", "mich", "dich", "sich",
                }
                en_stops = {
                    "the", "is", "are", "was", "were", "have", "has", "do", "does",
                    "did", "will", "would", "could", "should", "can", "may", "how",
                    "what", "when", "where", "why", "who", "this", "that", "these",
                    "those", "i", "you", "he", "she", "it", "we", "they", "my", "your",
                    "his", "her", "its", "our", "their", "a", "an", "in", "on", "at",
                    "to", "for", "with", "from", "about", "into", "through", "during",
                    "before", "after", "above", "below", "between", "just", "also",
                    "than", "then", "so", "if", "or", "but", "not", "no", "yes",
                    "all", "each", "every", "both", "few", "more", "most", "other",
                    "some", "such", "only", "own", "same", "very", "too", "quite",
                    "request", "open", "ticket", "select", "please", "want", "need",
                    "help", "server", "here", "there", "which", "been", "being",
                }
                fr_stops = {
                    "le", "la", "les", "un", "une", "des", "je", "tu", "il", "elle",
                    "nous", "vous", "ils", "elles", "de", "du", "au", "aux", "et",
                    "ou", "mais", "donc", "car", "ni", "que", "qui", "quoi", "où",
                    "comment", "pourquoi", "quand", "est", "sont", "suis", "es",
                    "avoir", "être", "faire", "aller", "voir", "pouvoir", "vouloir",
                    "pas", "ne", "plus", "très", "bien", "mal", "oui", "non",
                    "avec", "dans", "sur", "sous", "pour", "par", "sans", "chez",
                }
                es_stops = {
                    "el", "la", "los", "las", "un", "una", "unos", "unas", "yo",
                    "tú", "él", "ella", "nosotros", "vosotros", "ellos", "ellas",
                    "de", "del", "al", "y", "o", "pero", "sino", "que", "como",
                    "qué", "quién", "dónde", "cuándo", "por", "para", "con", "sin",
                    "es", "son", "soy", "eres", "está", "están", "estoy", "estás",
                    "hola", "sí", "no", "muy", "bien", "mal", "aquí", "allí",
                    "más", "menos", "también", "este", "esta", "estos", "estas",
                }

                scores = {
                    "de": len(word_set & de_stops),
                    "en": len(word_set & en_stops),
                    "fr": len(word_set & fr_stops),
                    "es": len(word_set & es_stops),
                }
                best = max(scores, key=scores.get)
                if scores[best] == 0:
                    return "unknown"
                return best

            msg_words = text.split()
            context_words = [w for w in msg_words if w.lower().strip(".,!?;:\"'()") != trigger.lower()]
            resp_words = response.split()

            msg_lang = detect_lang(context_words)
            resp_lang = detect_lang(resp_words)

            if msg_lang != "unknown" and resp_lang != "unknown" and msg_lang != resp_lang:
                return False


            try:
                import g4f
                from g4f.client import AsyncClient
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

                prompt = (f"You are a strict context checker.\n"
                          f"Trigger Word: '{trigger}'\n"
                          f"Bot's intended Response: '{response}'\n"
                          f"User's Message: '{text}'\n\n"
                          f"Does the user mean the trigger word in the same context as the bot's response?\n"
                          f"Answer ONLY with YES or NO.")

                res = await client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "user", "content": prompt}],
                )
                answer = res.choices[0].message.content.strip().lower()
                return "yes" in answer
            except Exception:
                return True

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
