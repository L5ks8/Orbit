import re
import re

def parse_duration(time_str: str) -> int | None:
    clean_str = time_str.lower().strip()
    pattern = re.compile(r"(\d+)\s*([smhd])")
    matches = pattern.findall(clean_str)
    if not matches:
        if clean_str.isdigit():
            return int(clean_str) * 60
        return None
    
    total_seconds = 0
    for value, unit in matches:
        val = int(value)
        if unit == "s":
            total_seconds += val
        elif unit == "m":
            total_seconds += val * 60
        elif unit == "h":
            total_seconds += val * 3600
        elif unit == "d":
            total_seconds += val * 86400
    return total_seconds if total_seconds > 0 else None



