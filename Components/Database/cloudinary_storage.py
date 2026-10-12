import os
import cloudinary
import cloudinary.uploader
import cloudinary.api

_configured = False

def configure_cloudinary():
    global _configured
    if _configured:
        return
        
    url = os.environ.get("CLOUDINARY_URL")
    if not url:
        from dotenv import load_dotenv
        load_dotenv()
        url = os.environ.get("CLOUDINARY_URL")
        
    if url:
        cloudinary.config()
        _configured = True
    else:
        print("WARNING: CLOUDINARY_URL is not set.")

def upload_image_bytes(file_bytes: bytes, folder: str = "Orbit") -> str:
    configure_cloudinary()
    if not _configured:
        return ""
        
    try:
        response = cloudinary.uploader.upload(
            file_bytes,
            folder=folder,
            resource_type="image"
        )
        return response.get("secure_url", "")
    except Exception as e:
        print(f"Cloudinary upload error: {e}")
        return ""

def delete_image_by_url(url: str) -> bool:
    if not url or "res.cloudinary.com" not in url:
        return False
        
    configure_cloudinary()
    if not _configured:
        return False
        
    try:
        parts = url.split("/upload/")
        if len(parts) < 2:
            return False
            
        path_parts = parts[1].split("/")
        
        if path_parts[0].startswith("v") and path_parts[0][1:].isdigit():
            path_parts.pop(0)
            
        public_id_with_ext = "/".join(path_parts)
        public_id = public_id_with_ext.rsplit(".", 1)[0]
        
        response = cloudinary.uploader.destroy(public_id)
        return response.get("result") == "ok"
    except Exception as e:
        print(f"Cloudinary delete error: {e}")
        return False
