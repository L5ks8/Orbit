import discord
from discord import app_commands
from discord.ext import commands
from deep_translator import GoogleTranslator
from Components.Commands._utils import ORBIT_COLOR, make_v2_card, make_embed
from Components.emojis import Emojis

class Translate(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="translate", description="Translates text into the desired language.")
    @app_commands.describe(
        language="The target language (e.g., 'en' for English, 'es' for Spanish)",
        text="The text to translate"
    )
    async def translate_cmd(self, ctx: commands.Context, language: str, *, text: str):
        await ctx.defer()
        try:
            translator = GoogleTranslator(source='auto', target=language.lower())
            translated_text = translator.translate(text)
            
            card = make_v2_card(f"# {Emojis.GLOBE_VERIFICATION} Google Translate (`{language}`)\n\n**Original:**\n{text[:1000]}\n\n**Translation:**\n{translated_text[:1000]}", color=ORBIT_COLOR)
            if card:
                return await ctx.send(view=card)

            embed = discord.Embed(title=f"{Emojis.GLOBE_VERIFICATION} Google Translate", color=ORBIT_COLOR)
            embed.set_author(name="Google Translate", icon_url="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Google_Translate_logo.svg/2048px-Google_Translate_logo.svg.png")
            embed.add_field(name="Original", value=text[:1024], inline=False)
            embed.add_field(name=f"Translation ({language})", value=translated_text[:1024], inline=False)
            
            await ctx.send(embed=embed)
        except Exception as e:
            await ctx.send(embed=make_embed(f"Translation error: {e}", discord.Color.red()), ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(Translate(bot))
