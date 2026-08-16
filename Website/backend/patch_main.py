import sys

file_path = "c:/Users/berkm/Downloads/Orbit/Orbit/Website/backend/main.py"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

import re

# 1. Replace _render_template and all handle_* methods that returned HTML with handle_spa
pattern1 = r'    def _render_template\(self, filepath: str\) -> str:.*?(?=    async def handle_login\(self, request: web\.Request\):)'
replacement1 = """    async def handle_spa(self, request: web.Request):
        import os
        path = request.match_info.get("tail", "").lstrip("/")
        
        if path.startswith("api/") or path.startswith("auth/"):
            return web.Response(text="Not Found", status=404)
            
        dist_dir = os.path.join("Website", "frontend", "dist")
        file_path = os.path.join(dist_dir, path)
        
        if path and os.path.exists(file_path) and os.path.isfile(file_path):
            return web.FileResponse(file_path)
            
        index_path = os.path.join(dist_dir, "index.html")
        if os.path.exists(index_path):
            return web.FileResponse(index_path)
            
        return web.Response(text="React Build Not Found. Run npm run build in Website/frontend", status=404)

"""
content = re.sub(pattern1, replacement1, content, flags=re.DOTALL)

# 2. Remove handle_verify_page
pattern2 = r'    async def handle_verify_page\(self, request: web\.Request\):.*?    async def handle_api_captcha\(self, request: web\.Request\):'
replacement2 = """    async def handle_api_captcha(self, request: web.Request):"""
content = re.sub(pattern2, replacement2, content, flags=re.DOTALL)

# 3. Update setup_web_app routes
pattern3 = r'    app\.router\.add_get\("/", dashboard\.handle_index\).*?app\.router\.add_get\("/auth/login", dashboard\.handle_login\)'
replacement3 = """    app.router.add_get("/auth/login", dashboard.handle_login)"""
content = re.sub(pattern3, replacement3, content, flags=re.DOTALL)

pattern4 = r'    app\.router\.add_get\("/verify/\{token\}", dashboard\.handle_verify_page\)\n'
replacement4 = ""
content = re.sub(pattern4, replacement4, content)

pattern5 = r'    app\.router\.add_get\("/appeal/\{custom_url\}", dashboard\.handle_appeal_page\)\n'
replacement5 = ""
content = re.sub(pattern5, replacement5, content)

pattern6 = r'    app\.router\.add_post\("/api/submit_appeal/\{custom_url\}", dashboard\.api_submit_appeal\)'
replacement6 = """    app.router.add_post("/api/submit_appeal/{custom_url}", dashboard.api_submit_appeal)

    app.router.add_get("/{tail:.*}", dashboard.handle_spa)"""
content = re.sub(pattern6, replacement6, content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Patched main.py successfully.")
