import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button, Modal, TextInput
from Commands.AutoMod._storage import load_automod_config, save_automod_config

class SpamThresholdsModal(Modal, title="Configure Anti-Spam Thresholds"):
    max_msgs_input = TextInput(
        label="Max Messages (in time window)",
        placeholder="e.g. 5",
        required=True,
        max_length=3
    )
    time_win_input = TextInput(
        label="Time Window (seconds)",
        placeholder="e.g. 3",
        required=True,
        max_length=3
    )
    max_mentions_input = TextInput(
        label="Max Mentions per Message",
        placeholder="e.g. 4",
        required=True,
        max_length=2
    )

    def __init__(self, guild_id: int, view: "AutoModDashboardLayout"):
        super().__init__()
        self.guild_id = guild_id
        self.dashboard_view = view
        config = load_automod_config(guild_id)
        self.max_msgs_input.default = str(config["anti_spam"]["max_messages"])
        self.time_win_input.default = str(config["anti_spam"]["time_window_sec"])
        self.max_mentions_input.default = str(config["anti_spam"]["max_mentions"])

    async def on_submit(self, interaction: discord.Interaction):
        try:
            m_msgs = int(self.max_msgs_input.value.strip())
            t_win = int(self.time_win_input.value.strip())
            m_mentions = int(self.max_mentions_input.value.strip())
            if m_msgs < 2 or t_win < 1 or m_mentions < 1:
                raise ValueError()
        except ValueError:
            return await interaction.response.send_message("Please enter valid positive numbers (Max messages >= 2, Time window >= 1).", ephemeral=True)

        config = load_automod_config(self.guild_id)
        config["anti_spam"]["max_messages"] = m_msgs
        config["anti_spam"]["time_window_sec"] = t_win
        config["anti_spam"]["max_mentions"] = m_mentions
        save_automod_config(self.guild_id, config)

        self.dashboard_view.refresh_content(self.guild_id)
        await interaction.response.edit_message(view=self.dashboard_view)
        await interaction.followup.send(f"Updated Anti-Spam settings: {m_msgs} msgs in {t_win}s, Max Mentions: {m_mentions}.", ephemeral=True)

class AntiAltAgeModal(Modal, title="Configure Anti-Alt Minimum Age"):
    min_age_input = TextInput(
        label="Minimum Account Age (in days)",
        placeholder="e.g. 3",
        required=True,
        max_length=3
    )

    def __init__(self, guild_id: int, view: "AutoModDashboardLayout"):
        super().__init__()
        self.guild_id = guild_id
        self.dashboard_view = view
        config = load_automod_config(guild_id)
        self.min_age_input.default = str(config["anti_alt"]["min_age_days"])

    async def on_submit(self, interaction: discord.Interaction):
        try:
            age = int(self.min_age_input.value.strip())
            if age < 0:
                raise ValueError()
        except ValueError:
            return await interaction.response.send_message("Please enter a valid number of days (>= 0).", ephemeral=True)

        config = load_automod_config(self.guild_id)
        config["anti_alt"]["min_age_days"] = age
        save_automod_config(self.guild_id, config)

        self.dashboard_view.refresh_content(self.guild_id)
        await interaction.response.edit_message(view=self.dashboard_view)
        await interaction.followup.send(f"Updated Anti-Alt minimum account age requirement to {age} days.", ephemeral=True)

class AutoModDashboardLayout(discord.ui.View):
    def __init__(self, guild_id: int):
        super().__init__(timeout=300.0)
        self.guild_id = guild_id
        self.build_components()

    def get_kwargs(self):
        config = load_automod_config(self.guild_id)
        is_enabled = config.get("enabled", False)
        status_badge = "ACTIVE" if is_enabled else "INACTIVE"

        link_cfg = config["anti_link"]
        link_str = f"Enabled (Action: {link_cfg['action'].upper()})" if link_cfg["enabled"] else "Disabled"

        spam_cfg = config["anti_spam"]
        spam_action = f"WARN (Escalating Timeout @ 5+ warns)" if spam_cfg["action"] == "warn" else "TIMEOUT (5 min)"
        spam_str = f"Enabled ({spam_cfg['max_messages']} msgs/{spam_cfg['time_window_sec']}s, Max Mentions: {spam_cfg['max_mentions']} | Action: {spam_action})" if spam_cfg["enabled"] else "Disabled"

        alt_cfg = config["anti_alt"]
        alt_str = f"Enabled (Min Age: {alt_cfg['min_age_days']} days | Action: {alt_cfg['action'].upper()})" if alt_cfg["enabled"] else "Disabled"
        
        self.btn_master.label = "Toggle AutoMod Master" if not is_enabled else "Disable AutoMod"
        self.btn_master.style = discord.ButtonStyle.success if not is_enabled else discord.ButtonStyle.danger
        
        self.btn_link.style = discord.ButtonStyle.primary if link_cfg["enabled"] else discord.ButtonStyle.secondary
        self.btn_spam.style = discord.ButtonStyle.primary if spam_cfg["enabled"] else discord.ButtonStyle.secondary
        self.btn_alt.style = discord.ButtonStyle.primary if alt_cfg["enabled"] else discord.ButtonStyle.secondary

        from Embeds import get_command_embed
        return get_command_embed(self.guild_id, "automod", msg_type="dashboard", status_badge=status_badge, link_str=link_str, spam_str=spam_str, alt_str=alt_str, components=self.children)

    def build_components(self):


        self.btn_master = Button(label="Toggle AutoMod", custom_id="automod_btn_master")
        self.btn_link = Button(label="Cycle Anti-Link Action", custom_id="automod_btn_link")
        self.btn_spam = Button(label="Cycle Anti-Spam Action", custom_id="automod_btn_spam")
        self.btn_spam_cfg = Button(label="Set Spam Thresholds", style=discord.ButtonStyle.secondary, custom_id="automod_btn_spam_cfg")
        self.btn_alt = Button(label="Cycle Anti-Alt Action", custom_id="automod_btn_alt")
        self.btn_alt_cfg = Button(label="Set Min Account Age", style=discord.ButtonStyle.secondary, custom_id="automod_btn_alt_cfg")
        self.btn_close = Button(label="Close Dashboard", style=discord.ButtonStyle.danger, custom_id="automod_btn_close")

        async def master_cb(interaction: discord.Interaction):
            cfg = load_automod_config(self.guild_id)
            cfg["enabled"] = not cfg.get("enabled", False)
            save_automod_config(self.guild_id, cfg)
            await interaction.response.edit_message(**self.get_kwargs(), allowed_mentions=discord.AllowedMentions.none())

        async def link_cb(interaction: discord.Interaction):
            cfg = load_automod_config(self.guild_id)
            if not cfg["anti_link"]["enabled"]:
                cfg["anti_link"]["enabled"] = True
                cfg["anti_link"]["action"] = "warn"
            elif cfg["anti_link"]["action"] == "warn":
                cfg["anti_link"]["action"] = "timeout"
            else:
                cfg["anti_link"]["enabled"] = False
            save_automod_config(self.guild_id, cfg)
            await interaction.response.edit_message(**self.get_kwargs(), allowed_mentions=discord.AllowedMentions.none())

        async def spam_cb(interaction: discord.Interaction):
            cfg = load_automod_config(self.guild_id)
            if not cfg["anti_spam"]["enabled"]:
                cfg["anti_spam"]["enabled"] = True
                cfg["anti_spam"]["action"] = "warn"
            elif cfg["anti_spam"]["action"] == "warn":
                cfg["anti_spam"]["action"] = "timeout"
            else:
                cfg["anti_spam"]["enabled"] = False
            save_automod_config(self.guild_id, cfg)
            await interaction.response.edit_message(**self.get_kwargs(), allowed_mentions=discord.AllowedMentions.none())

        async def spam_cfg_cb(interaction: discord.Interaction):
            modal = SpamThresholdsModal(self.guild_id, self)
            await interaction.response.send_modal(modal)

        async def alt_cb(interaction: discord.Interaction):
            cfg = load_automod_config(self.guild_id)
            if not cfg["anti_alt"]["enabled"]:
                cfg["anti_alt"]["enabled"] = True
                cfg["anti_alt"]["action"] = "kick"
            elif cfg["anti_alt"]["action"] == "kick":
                cfg["anti_alt"]["action"] = "verify"
            else:
                cfg["anti_alt"]["enabled"] = False
            save_automod_config(self.guild_id, cfg)
            await interaction.response.edit_message(**self.get_kwargs(), allowed_mentions=discord.AllowedMentions.none())

        async def alt_cfg_cb(interaction: discord.Interaction):
            modal = AntiAltAgeModal(self.guild_id, self)
            await interaction.response.send_modal(modal)

        async def close_cb(interaction: discord.Interaction):
            try:
                await interaction.message.delete()
            except Exception:
                await interaction.response.send_message("Dashboard closed.", ephemeral=True)

        self.btn_master.callback = master_cb
        self.btn_link.callback = link_cb
        self.btn_spam.callback = spam_cb
        self.btn_spam_cfg.callback = spam_cfg_cb
        self.btn_alt.callback = alt_cb
        self.btn_alt_cfg.callback = alt_cfg_cb
        self.btn_close.callback = close_cb

        self.add_item(self.btn_master)
        self.add_item(self.btn_link)
        self.add_item(self.btn_spam)
        self.add_item(self.btn_spam_cfg)
        self.add_item(self.btn_alt)
        self.add_item(self.btn_alt_cfg)
        self.add_item(self.btn_close)

