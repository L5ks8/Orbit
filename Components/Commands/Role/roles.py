import math
import discord
from discord import app_commands
from discord.ext import commands
from discord.ui import Button
from Components.Commands._utils import make_embed, ORBIT_COLOR, InteractionContext
from Components.emojis import Emojis

class AllRolesLayout(discord.ui.View):
    def __init__(self, guild: discord.Guild, roles: list[discord.Role], author_id: int):
        super().__init__()
        self.guild = guild
        self.roles = roles
        self.author_id = author_id
        self.page = 1
        self.per_page = 20
        self.total_pages = max(1, math.ceil(len(self.roles) / self.per_page))
        self.refresh_page()

    def refresh_page(self):
        self.clear_items()

        btn_close = Button(label="Close", style=discord.ButtonStyle.danger)

        async def close_callback(interaction: discord.Interaction):
            if interaction.user.id != self.author_id:
                return await interaction.response.send_message(embed=make_embed("You cannot control this panel.", discord.Color.red()), ephemeral=True)
            try:
                await interaction.message.delete()
            except Exception:
                await interaction.response.edit_message(content="Session ended by moderator.", embed=None, view=None)
                self.stop()

        btn_close.callback = close_callback

        if self.total_pages > 1:
            btn_prev = Button(label="Previous", style=discord.ButtonStyle.secondary, disabled=(self.page <= 1))
            btn_next = Button(label="Next", style=discord.ButtonStyle.secondary, disabled=(self.page >= self.total_pages))

            async def prev_callback(interaction: discord.Interaction):
                if interaction.user.id != self.author_id:
                    return await interaction.response.send_message(embed=make_embed("You cannot control these pagination buttons.", discord.Color.red()), ephemeral=True)
                if self.page > 1:
                    self.page -= 1
                    self.refresh_page()
                    await interaction.response.edit_message(**self.get_kwargs(interaction.guild_id))

            async def next_callback(interaction: discord.Interaction):
                if interaction.user.id != self.author_id:
                    return await interaction.response.send_message(embed=make_embed("You cannot control these pagination buttons.", discord.Color.red()), ephemeral=True)
                if self.page < self.total_pages:
                    self.page += 1
                    self.refresh_page()
                    await interaction.response.edit_message(**self.get_kwargs(interaction.guild_id))

            btn_prev.callback = prev_callback
            btn_next.callback = next_callback

        components = []
        if self.total_pages > 1:
            components.extend([btn_prev, btn_next])
        components.append(btn_close)

        for comp in components:
            self.add_item(comp)

    def get_kwargs(self, guild_id: int):
        start_idx = (self.page - 1) * self.per_page
        end_idx = start_idx + self.per_page
        current_roles = self.roles[start_idx:end_idx]

        lines = []
        for index, r in enumerate(current_roles, start=start_idx + 1):
            lines.append(f"`{index}.` {r.mention} - ID: `{r.id}` | Members: `{len(r.members)}`")

        roles_text = "\n".join(lines) if lines else "No roles found on this page."
        
        embed = discord.Embed(title=f"Server Roles (Page {self.page} of {self.total_pages})", description=roles_text, color=ORBIT_COLOR)
        embed.add_field(name="Total Roles", value=f"`{len(self.roles)}`", inline=False)
        
        return {"embed": embed, "view": self}

async def _do_allroles(ctx: commands.Context):
    await ctx.defer()
    if not ctx.guild:
        return await ctx.send(embed=make_embed("This command must be run inside a server.", discord.Color.red()), ephemeral=True)

    roles = [r for r in reversed(ctx.guild.roles) if not r.is_default()]
    if not roles:
        return await ctx.send(embed=make_embed("There are no custom roles on this server."), ephemeral=True)

    view = AllRolesLayout(ctx.guild, roles, ctx.author.id)
    kwargs = view.get_kwargs(ctx.guild.id)
    await ctx.send(**kwargs, allowed_mentions=discord.AllowedMentions.none())

@app_commands.command(name="allroles", description="Display all roles on the server.")
async def allroles_cmd(interaction: discord.Interaction):
    ctx = InteractionContext(interaction)
    await _do_allroles(ctx)

async def setup(bot: commands.Bot):
    bot.tree.add_command(allroles_cmd)
