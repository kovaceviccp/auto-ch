import os
import shutil
import uuid
from fastapi import UploadFile
from app.core.config import settings


async def upload_image(file: UploadFile, listing_id: int) -> str:
    ext = file.filename.split(".")[-1].lower()
    filename = f"{uuid.uuid4()}.{ext}"

    if settings.USE_SUPABASE:
        from supabase import create_client
        path = f"listings/{listing_id}/{filename}"
        file.file.seek(0)
        data = file.file.read()
        client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        client.storage.from_(settings.SUPABASE_BUCKET).upload(
            path, data, {"content-type": file.content_type or "image/jpeg"}
        )
        return f"{settings.SUPABASE_URL}/storage/v1/object/public/{settings.SUPABASE_BUCKET}/{path}"

    # Local fallback
    dir_path = f"{settings.UPLOAD_DIR}/{listing_id}"
    os.makedirs(dir_path, exist_ok=True)
    file.file.seek(0)
    with open(f"{dir_path}/{filename}", "wb") as f:
        shutil.copyfileobj(file.file, f)
    return f"/uploads/{listing_id}/{filename}"
