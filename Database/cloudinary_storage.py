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
        # cloudinary configures itself automatically from the CLOUDINARY_URL env var
        # if we just import it, but we can force it:
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
