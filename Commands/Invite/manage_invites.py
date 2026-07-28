import discord
from discord.ext import commands
from Commands.Invite._storage import (
    add_fake_invites, remove_fake_invites,
    add_bonus_invites, remove_bonus_invites,
    reset_invites
)
from Commands._utils import format_usage
from Embeds import get_command_embed


class ManageInvitesCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="addfakeinvites", description="Add fake invites to a specific user.")
    @commands.has_permissions(manage_guild=True)
    async def addfakeinvites(self, ctx: commands.Context, user: discord.Member, amount: int):
        await ctx.defer()
        if amount <= 0:
            return await ctx.send("Amount must be greater than 0.", ephemeral=True)
            
        add_fake_invites(ctx.guild.id, user.id, amount)
        
        kwargs = get_command_embed(ctx.guild.id, "manage_invites", msg_type="success", action="Added", type="fake", user=user, amount=amount)
        await ctx.send(**kwargs, allowed_mentions=discord.AllowedMentions.none())

    @addfakeinvites.error
    async def addfakeinvites_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You do not have permission to manage invites.", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

    @commands.hybrid_command(name="removefakeinvites", description="Remove fake invites from a specific user.")
    @commands.has_permissions(manage_guild=True)
    async def removefakeinvites(self, ctx: commands.Context, user: discord.Member, amount: int):
        await ctx.defer()
        if amount <= 0:
            return await ctx.send("Amount must be greater than 0.", ephemeral=True)
            
        remove_fake_invites(ctx.guild.id, user.id, amount)
        
        kwargs = get_command_embed(ctx.guild.id, "manage_invites", msg_type="success", action="Removed", type="fake", user=user, amount=amount)
        await ctx.send(**kwargs, allowed_mentions=discord.AllowedMentions.none())

    @removefakeinvites.error
    async def removefakeinvites_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You do not have permission to manage invites.", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

    @commands.hybrid_command(name="addinvites", description="Add regular invites to a specific user.")
    @commands.has_permissions(manage_guild=True)
    async def addinvites(self, ctx: commands.Context, user: discord.Member, amount: int):
        await ctx.defer()
        if amount <= 0:
            return await ctx.send("Amount must be greater than 0.", ephemeral=True)
            
        add_bonus_invites(ctx.guild.id, user.id, amount)
        
        kwargs = get_command_embed(ctx.guild.id, "manage_invites", msg_type="success", action="Added", type="regular", user=user, amount=amount)
        await ctx.send(**kwargs, allowed_mentions=discord.AllowedMentions.none())

    @addinvites.error
    async def addinvites_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You do not have permission to manage invites.", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

    @commands.hybrid_command(name="removeinvites", description="Remove regular invites from a specific user.")
    @commands.has_permissions(manage_guild=True)
    async def removeinvites(self, ctx: commands.Context, user: discord.Member, amount: int):
        await ctx.defer()
        if amount <= 0:
            return await ctx.send("Amount must be greater than 0.", ephemeral=True)
            
        remove_bonus_invites(ctx.guild.id, user.id, amount)
        
        kwargs = get_command_embed(ctx.guild.id, "manage_invites", msg_type="success", action="Removed", type="regular", user=user, amount=amount)
        await ctx.send(**kwargs, allowed_mentions=discord.AllowedMentions.none())

    @removeinvites.error
    async def removeinvites_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You do not have permission to manage invites.", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

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
            
        kwargs = get_command_embed(ctx.guild.id, "manage_invites", msg_type="reset", msg=msg)
        await ctx.send(**kwargs, allowed_mentions=discord.AllowedMentions.none())

    @resetinvites.error
    async def resetinvites_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You do not have permission to manage invites.", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(ManageInvitesCommand(bot))
