import importlib
from Commands.WebDashboard._storage import load_settings_config

def get_command_embed(guild_id: int, command_name: str, **kwargs):
    """
    Fetches the embed (or view) for a given command based on the guild's preferred style.
    
    Args:
        guild_id (int): The ID of the guild where the command is executed.
        command_name (str): The name of the command (e.g., 'checkban').
        **kwargs: Dynamic arguments to pass to the embed builder.
        
    Returns:
        dict: A dictionary containing the kwargs for ctx.send() or interaction.response.send_message().
              For example: {"embed": embed_obj} or {"view": layout_view_obj}
    """
    # Load guild settings
    settings = load_settings_config(guild_id)
    style = settings.get("embed_style", "normal")
    
    module_name = f"Embeds.{command_name}.{style}"
    
    try:
        # Try to load the user's preferred style
        module = importlib.import_module(module_name)
        return module.get_embed(**kwargs)
    except (ImportError, AttributeError):
        # Fallback to 'normal' if the selected style doesn't exist for this command
        try:
            fallback = importlib.import_module(f"Embeds.{command_name}.normal")
            return fallback.get_embed(**kwargs)
        except (ImportError, AttributeError):
            return {"content": "Error: Embed configuration missing for this command."}
