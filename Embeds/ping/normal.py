import discord

def get_embed(**kwargs):
    latency = kwargs.get("latency", 0)
    ms = round(latency * 1000)
    
    embed = discord.Embed(
        title="Pong",
        description=f"**Latency:** `{ms} ms`",
        color=discord.Color.blue()
    )
    return {"embed": embed}
