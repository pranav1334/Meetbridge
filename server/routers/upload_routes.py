from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
import os
import shutil
from uuid import uuid4

from auth import get_current_user
from models import User

router = APIRouter(prefix="/api/uploads", tags=["Uploads"])

UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)

BASE_URL = os.getenv("BACKEND_URL", "http://127.0.0.1:8000")

MAX_FILE_SIZE = 2 * 1024 * 1024


@router.post("/image")
def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    allowed_types = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/webp",
    ]

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG, JPEG, and WEBP images are allowed"
        )

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Invalid file name"
        )

    file.file.seek(0, os.SEEK_END)
    file_size = file.file.tell()
    file.file.seek(0)

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="Image must be less than 2MB"
        )

    file_extension = file.filename.split(".")[-1].lower()

    if file_extension not in ["jpg", "jpeg", "png", "webp"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid image extension"
        )

    file_name = f"{uuid4()}.{file_extension}"

    file_path = os.path.join(
        UPLOAD_DIR,
        file_name
    )

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "message": "Image uploaded successfully",
        "image_url": f"{BASE_URL}/uploads/{file_name}"
    }