import discord
from discord.ext import commands
from Components.Commands.Invite._storage import (
    add_fake_invites, remove_fake_invites,
    add_bonus_invites, remove_bonus_invites,
    reset_invites
)
from Components.Commands._utils import format_usage, make_embed


class ManageInvitesCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="addfakeinvites", description="Add fake invites to a specific user.")
    @commands.has_permissions(manage_guild=True)
    async def addfakeinvites(self, ctx: commands.Context, user: discord.Member, amount: int):
        await ctx.defer()
        if amount <= 0:
            return await ctx.send(embed=make_embed("Amount must be greater than 0.", discord.Color.red()), ephemeral=True)
            
        add_fake_invites(ctx.guild.id, user.id, amount)
        
        embed = discord.Embed(
            title="Invites Managed",
            description=f"Added **{amount}** fake invites for {user.mention}.",
            color=discord.Color.green()
        )
        await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())

    @addfakeinvites.error
    async def addfakeinvites_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send(embed=make_embed("You do not have permission to manage invites.", discord.Color.red()), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

    @commands.hybrid_command(name="removefakeinvites", description="Remove fake invites from a specific user.")
    @commands.has_permissions(manage_guild=True)
    async def removefakeinvites(self, ctx: commands.Context, user: discord.Member, amount: int):
        await ctx.defer()
        if amount <= 0:
            return await ctx.send(embed=make_embed("Amount must be greater than 0.", discord.Color.red()), ephemeral=True)
            
        remove_fake_invites(ctx.guild.id, user.id, amount)
        
        embed = discord.Embed(
            title="Invites Managed",
            description=f"Removed **{amount}** fake invites for {user.mention}.",
            color=discord.Color.green()
        )
        await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())

    @removefakeinvites.error
    async def removefakeinvites_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send(embed=make_embed("You do not have permission to manage invites.", discord.Color.red()), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

    @commands.hybrid_command(name="addinvites", description="Add regular invites to a specific user.")
    @commands.has_permissions(manage_guild=True)
    async def addinvites(self, ctx: commands.Context, user: discord.Member, amount: int):
        await ctx.defer()
        if amount <= 0:
            return await ctx.send(embed=make_embed("Amount must be greater than 0.", discord.Color.red()), ephemeral=True)
            
        add_bonus_invites(ctx.guild.id, user.id, amount)
        
        embed = discord.Embed(
            title="Invites Managed",
            description=f"Added **{amount}** regular invites for {user.mention}.",
            color=discord.Color.green()
        )
        await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())

    @addinvites.error
    async def addinvites_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send(embed=make_embed("You do not have permission to manage invites.", discord.Color.red()), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

    @commands.hybrid_command(name="removeinvites", description="Remove regular invites from a specific user.")
    @commands.has_permissions(manage_guild=True)
    async def removeinvites(self, ctx: commands.Context, user: discord.Member, amount: int):
        await ctx.defer()
        if amount <= 0:
            return await ctx.send(embed=make_embed("Amount must be greater than 0.", discord.Color.red()), ephemeral=True)
            
        remove_bonus_invites(ctx.guild.id, user.id, amount)
        
        embed = discord.Embed(
            title="Invites Managed",
            description=f"Removed **{amount}** regular invites for {user.mention}.",
            color=discord.Color.green()
        )
        await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())

    @removeinvites.error
    async def removeinvites_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send(embed=make_embed("You do not have permission to manage invites.", discord.Color.red()), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

    @commands.hybrid_command(name="resetinvites", description="Reset the invites for a specific user or for the whole server.")
    @commands.has_permissions(manage_guild=True)
    async def resetinvites(self, ctx: commands.Context, user: discord.Member = None):
        await ctx.defer()
        
        if user:
            reset_invites(ctx.guild.id, user.id)
            msg = f"Reset all invites for {user.mention}."
        else:
            reset_invites(ctx.guild.id)
            msg = "Reset all invites for the entire server."
            
        embed = discord.Embed(
            title="Invites Reset",
            description=msg,
            color=discord.Color.red()
        )
        await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())

    @resetinvites.error
    async def resetinvites_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send(embed=make_embed("You do not have permission to manage invites.", discord.Color.red()), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(ManageInvitesCommand(bot))

