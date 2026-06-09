from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import os
from dotenv import load_dotenv

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from database import get_db
from models import User
from schemas import RegisterUser, LoginUser, GoogleLoginRequest
from auth import hash_password, verify_password, create_access_token, get_current_user

load_dotenv()

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")


def get_default_role(email: str):
    admin_emails = os.getenv("ADMIN_EMAILS", "")

    admin_email_list = [
        item.strip().lower()
        for item in admin_emails.split(",")
        if item.strip()
    ]

    if email.strip().lower() in admin_email_list:
        return "admin"

    return "member"


def make_user_response(user: User):
    token = create_access_token({
        "user_id": user.id,
        "email": user.email,
        "role": user.role
    })

    return {
        "message": "Login successful",
        "token": token,
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role
        }
    }


@router.post("/register")
def register_user(user: RegisterUser, db: Session = Depends(get_db)):
    user_email = user.email.strip().lower()

    existing_user = db.query(User).filter(User.email == user_email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_role = get_default_role(user_email)

    new_user = User(
        full_name=user.full_name,
        email=user_email,
        password=hash_password(user.password),
        role=user_role,
        profession=user.profession,
        company_college=user.company_college,
        city=user.city,
        bio=user.bio,
        linkedin_url=user.linkedin_url,
        looking_for=user.looking_for,
        can_help_with=user.can_help_with
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({
        "user_id": new_user.id,
        "email": new_user.email,
        "role": new_user.role
    })

    return {
        "message": "Registration successful",
        "token": token,
        "user": {
            "id": new_user.id,
            "full_name": new_user.full_name,
            "email": new_user.email,
            "role": new_user.role
        }
    }


@router.post("/login")
def login_user(user: LoginUser, db: Session = Depends(get_db)):
    user_email = user.email.strip().lower()

    db_user = db.query(User).filter(User.email == user_email).first()

    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    correct_role = get_default_role(db_user.email)

    if db_user.role != correct_role:
        db_user.role = correct_role
        db.commit()
        db.refresh(db_user)

    token = create_access_token({
        "user_id": db_user.id,
        "email": db_user.email,
        "role": db_user.role
    })

    return {
        "message": "Login successful",
        "token": token,
        "user": {
            "id": db_user.id,
            "full_name": db_user.full_name,
            "email": db_user.email,
            "role": db_user.role
        }
    }


@router.post("/google")
def google_login(data: GoogleLoginRequest, db: Session = Depends(get_db)):
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=500,
            detail="GOOGLE_CLIENT_ID not found in .env file"
        )

    try:
        google_user = id_token.verify_oauth2_token(
            data.credential,
            google_requests.Request(),
            GOOGLE_CLIENT_ID
        )
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    email = google_user.get("email", "").strip().lower()
    full_name = google_user.get("name", "")
    picture = google_user.get("picture", "")

    if not email:
        raise HTTPException(status_code=400, detail="Google account email not found")

    db_user = db.query(User).filter(User.email == email).first()

    correct_role = get_default_role(email)

    if db_user:
        db_user.role = correct_role

        if picture and not db_user.profile_picture:
            db_user.profile_picture = picture

        db.commit()
        db.refresh(db_user)

        return make_user_response(db_user)

    new_user = User(
        full_name=full_name or email.split("@")[0],
        email=email,
        password=hash_password("google_login_user_no_password"),
        role=correct_role,
        profile_picture=picture,
        profession=None,
        company_college=None,
        city=None,
        bio="",
        linkedin_url=None,
        looking_for="",
        can_help_with=""
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return make_user_response(new_user)


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role,
        "profile_picture": current_user.profile_picture,
        "profession": current_user.profession,
        "company_college": current_user.company_college,
        "city": current_user.city,
        "bio": current_user.bio,
        "linkedin_url": current_user.linkedin_url,
        "looking_for": current_user.looking_for,
        "can_help_with": current_user.can_help_with
    }