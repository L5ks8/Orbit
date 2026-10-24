import discord
from discord.ext import commands
from Components.Commands.Poll._storage import (
    get_poll_entry,
    record_vote,
    remove_vote
)
from Components.Commands.Poll.poll import build_poll_kwargs
from Components.Commands._utils import make_embed

class PollListener(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_interaction(self, interaction: discord.Interaction):
        if interaction.type != discord.InteractionType.component:
            return

        custom_id = interaction.data.get("custom_id", "")
        if not custom_id.startswith("orbit:poll_"):
            return

        if not interaction.guild:
            return await interaction.response.send_message(
                embed=make_embed("Polls can only be interacted with inside servers.", discord.Color.red()),
                ephemeral=True
            )

        if custom_id.startswith("orbit:poll_closed:"):
            return await interaction.response.send_message(
                embed=make_embed("This poll has already concluded and is closed.", discord.Color.red()),
                ephemeral=True
            )

        if custom_id.startswith("orbit:poll_leave:"):
            parts = custom_id.split(":")
            if len(parts) < 3:
                return
            poll_id = parts[2]
            poll = get_poll_entry(interaction.guild.id, poll_id)
            if not poll or poll.get("closed"):
                return await interaction.response.send_message(
                    embed=make_embed("This poll is closed or no longer available.", discord.Color.red()),
                    ephemeral=True
                )

            req_role = str(poll.get("required_role_id") or "").strip()
            if req_role and req_role.isdigit() and isinstance(interaction.user, discord.Member):
                if not any(r.id == int(req_role) for r in interaction.user.roles) and not interaction.user.guild_permissions.administrator:
                    return await interaction.response.send_message(
                        embed=make_embed(f"You need the <@&{req_role}> role to vote in this poll.", discord.Color.red()),
                        ephemeral=True
                    )

            removed, updated_entry = remove_vote(interaction.guild.id, poll_id, interaction.user.id)
            if removed and updated_entry:
                await interaction.response.send_message(
                    embed=make_embed("You have removed your vote from this poll.", discord.Color.dark_grey()),
                    ephemeral=True
                )
                try:
                    kwargs = build_poll_kwargs(updated_entry, ended=False)
                    await interaction.message.edit(**kwargs)
                except Exception as e:
                    print(f"[Poll] Failed to update message on vote removal: {e}")
            else:
                await interaction.response.send_message(
                    embed=make_embed("You have not voted in this poll yet.", discord.Color.yellow()),
                    ephemeral=True
                )
            return

        if custom_id.startswith("orbit:poll_vote:"):
            parts = custom_id.split(":")
            if len(parts) < 4:
                return
            poll_id = parts[2]
            try:
                opt_idx = int(parts[3])
            except ValueError:
                return

            poll = get_poll_entry(interaction.guild.id, poll_id)
            if not poll or poll.get("closed"):
                return await interaction.response.send_message(
                    embed=make_embed("This poll is closed or no longer available.", discord.Color.red()),
                    ephemeral=True
                )

            req_role = str(poll.get("required_role_id") or "").strip()
            if req_role and req_role.isdigit() and isinstance(interaction.user, discord.Member):
                if not any(r.id == int(req_role) for r in interaction.user.roles) and not interaction.user.guild_permissions.administrator:
                    return await interaction.response.send_message(
                        embed=make_embed(f"You need the <@&{req_role}> role to vote in this poll.", discord.Color.red()),
                        ephemeral=True
                    )

            action, opt_name, updated_entry = record_vote(interaction.guild.id, poll_id, interaction.user.id, opt_idx)
            if action == "voted":
                await interaction.response.send_message(
                    embed=make_embed(f"You voted for **{opt_name}**!", discord.Color.green()),
                    ephemeral=True
                )
            elif action == "changed":
                await interaction.response.send_message(
                    embed=make_embed(f"You changed your vote to **{opt_name}**!", discord.Color.green()),
                    ephemeral=True
                )
            elif action == "removed":
                await interaction.response.send_message(
                    embed=make_embed(f"You removed your vote for **{opt_name}**.", discord.Color.dark_grey()),
                    ephemeral=True
                )
            else:
                return await interaction.response.send_message(
                    embed=make_embed("Could not record your vote. The poll might be closed.", discord.Color.red()),
                    ephemeral=True
                )

            if updated_entry:
                try:
                    kwargs = build_poll_kwargs(updated_entry, ended=False)
                    await interaction.message.edit(**kwargs)
                except Exception as e:
                    print(f"[Poll] Failed to update message on vote change ({e}), falling back to embed+view")
                    try:
                        from Components.Commands.Poll.poll import build_poll_embed, build_poll_view
                        fb_embed = build_poll_embed(updated_entry, ended=False)
                        fb_view = build_poll_view(updated_entry, ended=False)
                        await interaction.message.edit(content=None, embed=fb_embed, view=fb_view)
                    except Exception as e2:
                        print(f"[Poll] Fallback edit failed: {e2}")

async def setup(bot: commands.Bot):
    await bot.add_cog(PollListener(bot))
