from fastapi import APIRouter, UploadFile, File, HTTPException
import os
import shutil
from uuid import uuid4

router = APIRouter(prefix="/api/uploads", tags=["Uploads"])

UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/image")
def upload_image(file: UploadFile = File(...)):
    allowed_types = ["image/jpeg", "image/png", "image/jpg", "image/webp"]

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG, JPEG, and WEBP images are allowed"
        )

    file_extension = file.filename.split(".")[-1]
    file_name = f"{uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, file_name)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "message": "Image uploaded successfully",
        "image_url": f"http://127.0.0.1:8000/uploads/{file_name}"
    }