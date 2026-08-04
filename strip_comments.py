import os
import re
import tokenize
import io

def remove_python_comments(source_code):
    """Safely removes Python comments except section headers."""
    io_obj = io.StringIO(source_code)
    out = []
    prev_toktype = tokenize.INDENT
    last_lineno = -1
    last_col = 0
    
    try:
        tokens = tokenize.generate_tokens(io_obj.readline)
        for tok in tokens:
            token_type = tok[0]
            token_string = tok[1]
            start_line, start_col = tok[2]
            end_line, end_col = tok[3]
            
            if start_line > last_lineno:
                last_col = 0
            if start_col > last_col:
                out.append(" " * (start_col - last_col))
                
            if token_type == tokenize.COMMENT:
                # Keep important headers like # ---, # ===, # SECTION, etc.
                if re.match(r'^#\s*[-=]{3,}|^#\s*SECTION|^#\s*REGION', token_string, re.IGNORECASE):
                    out.append(token_string)
                else:
                    pass # skip comment
            else:
                out.append(token_string)
                
            last_col = end_col
            last_lineno = end_line
            
    except Exception as e:
        print(f"Error parsing Python file: {e}")
        return source_code
        
    return "".join(out)

def remove_html_comments(source_code):
    """Removes HTML <!-- --> comments except INCLUDE: statements."""
    def replacer(match):
        comment = match.group(0)
        if "INCLUDE:" in comment:
            return comment
        return ""
    
    return re.sub(r'<!--(.*?)-->', replacer, source_code, flags=re.DOTALL)

def remove_js_css_comments(source_code):
    """Removes // and /* */ comments in JS/CSS, ignoring urls."""
    # A robust regex for stripping comments from JS/CSS without breaking strings or urls.
    # We will use a simple regex that matches strings first (and keeps them) or matches comments (and drops them).
    
    pattern = re.compile(
        r'(?P<string>"(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\'|`(?:\\.|[^`\\])*`)'
        r'|(?P<block_comment>/\*.*?\*/)'
        r'|(?P<line_comment>//[^\r\n]*)',
        re.DOTALL | re.MULTILINE
    )
    
    def replacer(match):
        if match.group('string'):
            return match.group('string')
        elif match.group('block_comment'):
            comment = match.group('block_comment')
            if '=======' in comment or '-------' in comment:
                return comment
            return ""
        elif match.group('line_comment'):
            comment = match.group('line_comment')
            if '=======' in comment or '-------' in comment:
                return comment
            return ""
        return match.group(0)
        
    return pattern.sub(replacer, source_code)

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    ext = os.path.splitext(filepath)[1].lower()
    original_content = content
    
    if ext == '.py':
        content = remove_python_comments(content)
    elif ext == '.html':
        content = remove_html_comments(content)
        # Inside HTML, there could be <script> or <style> tags, but doing that with regex is risky.
        # We will just strip HTML comments to be safe.
    elif ext in ['.js', '.css']:
        content = remove_js_css_comments(content)
        
    if content != original_content:
        # Clean up empty lines caused by removing comments
        if ext == '.py':
            lines = content.split('\n')
            cleaned_lines = []
            for line in lines:
                if line.strip() == '' and len(cleaned_lines) > 0 and cleaned_lines[-1].strip() == '':
                    pass # skip excessive blank lines
                elif line.strip() == '':
                    pass # Also strip single empty lines if they were just comments
                else:
                    cleaned_lines.append(line)
            content = '\n'.join(cleaned_lines)
            
        with open(filepath, 'w', encoding='utf-8', newline='') as f:
            f.write(content)
        print(f"Cleaned {filepath}")

def main():
    dirs_to_clean = ["Commands", "Web", "Embeds", "bot.py"]
    base_dir = os.path.abspath(os.path.dirname(__file__))
    
    for d in dirs_to_clean:
        path = os.path.join(base_dir, d)
        if os.path.isfile(path):
            process_file(path)
        elif os.path.isdir(path):
            for root, dirs, files in os.walk(path):
                for file in files:
                    ext = os.path.splitext(file)[1].lower()
                    if ext in ['.py', '.html', '.js', '.css']:
                        process_file(os.path.join(root, file))

if __name__ == "__main__":
    main()
