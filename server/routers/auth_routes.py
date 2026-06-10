from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import os
import re
import bleach

from slowapi import Limiter
from slowapi.util import get_remote_address

from database import get_db
from models import User
from auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

limiter = Limiter(key_func=get_remote_address)


def clean_text(value):
    if value is None:
        return None

    cleaned = bleach.clean(
        str(value).strip(),
        tags=[],
        attributes={},
        strip=True
    )

    return cleaned


def validate_email(email: str):
    if not email:
        raise HTTPException(
            status_code=400,
            detail="Email is required"
        )

    email = email.strip().lower()

    pattern = r"^[^\s@]+@[^\s@]+\.[^\s@]+$"

    if not re.match(pattern, email):
        raise HTTPException(
            status_code=400,
            detail="Invalid email address"
        )

    return email


def validate_password(password: str):
    if not password:
        raise HTTPException(
            status_code=400,
            detail="Password is required"
        )

    if len(password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 6 characters"
        )

    if len(password) > 72:
        raise HTTPException(
            status_code=400,
            detail="Password is too long"
        )


def user_to_dict(user: User):
    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role,
        "profile_picture": user.profile_picture,
        "profession": user.profession,
        "company_college": user.company_college,
        "city": user.city,
        "bio": user.bio,
        "linkedin_url": user.linkedin_url,
        "instagram_url": user.instagram_url,
        "website_url": user.website_url,
        "looking_for": user.looking_for,
        "can_help_with": user.can_help_with,
        "auth_provider": user.auth_provider,
    }


@router.post("/register")
@limiter.limit("5/minute")
def register_user(
    request: Request,
    data: dict,
    db: Session = Depends(get_db)
):
    full_name = clean_text(data.get("full_name"))
    email = data.get("email")
    password = data.get("password")

    if not full_name or not email or not password:
        raise HTTPException(
            status_code=400,
            detail="Full name, email, and password are required"
        )

    email = validate_email(email)
    validate_password(password)

    existing_user = db.query(User).filter(
        User.email == email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    admin_emails = os.getenv("ADMIN_EMAILS", "")

    admin_email_list = [
        item.strip().lower()
        for item in admin_emails.split(",")
        if item.strip()
    ]

    role = "admin" if email in admin_email_list else "member"

    new_user = User(
        full_name=full_name,
        email=email,
        password=hash_password(password),
        role=role,
        profession=clean_text(data.get("profession")),
        company_college=clean_text(data.get("company_college")),
        city=clean_text(data.get("city")),
        bio=clean_text(data.get("bio")),
        looking_for=clean_text(data.get("looking_for")),
        can_help_with=clean_text(data.get("can_help_with")),
        auth_provider="local"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({
        "sub": new_user.email
    })

    return {
        "message": "Registration successful",
        "token": token,
        "user": user_to_dict(new_user)
    }


@router.post("/login")
@limiter.limit("10/minute")
def login_user(
    request: Request,
    data: dict,
    db: Session = Depends(get_db)
):
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        raise HTTPException(
            status_code=400,
            detail="Email and password are required"
        )

    email = validate_email(email)

    user = db.query(User).filter(
        User.email == email
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if user.auth_provider == "google" and not user.password:
        raise HTTPException(
            status_code=401,
            detail="This account uses Google login"
        )

    if not user.password:
        raise HTTPException(
            status_code=401,
            detail="Password not set"
        )

    if not verify_password(password, user.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_access_token({
        "sub": user.email
    })

    return {
        "message": "Login successful",
        "token": token,
        "user": user_to_dict(user)
    }


@router.post("/login-form")
@limiter.limit("10/minute")
def login_form(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    email = validate_email(form_data.username)
    password = form_data.password

    user = db.query(User).filter(
        User.email == email
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not user.password or not verify_password(password, user.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_access_token({
        "sub": user.email
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.post("/google")
@limiter.limit("10/minute")
def google_login(
    request: Request,
    data: dict,
    db: Session = Depends(get_db)
):
    google_client_id = os.getenv("GOOGLE_CLIENT_ID")

    if not google_client_id:
        raise HTTPException(
            status_code=500,
            detail="Google Client ID is not configured in backend"
        )

    credential_token = data.get("token")

    if not credential_token:
        raise HTTPException(
            status_code=400,
            detail="Google token is required"
        )

    try:
        idinfo = id_token.verify_oauth2_token(
            credential_token,
            google_requests.Request(),
            google_client_id
        )

        email = validate_email(idinfo.get("email", ""))

        full_name = clean_text(
            idinfo.get("name", "Google User")
        )

        profile_picture = idinfo.get("picture")

        user = db.query(User).filter(
            User.email == email
        ).first()

        admin_emails = os.getenv("ADMIN_EMAILS", "")

        admin_email_list = [
            item.strip().lower()
            for item in admin_emails.split(",")
            if item.strip()
        ]

        role = "admin" if email in admin_email_list else "member"

        if not user:
            user = User(
                full_name=full_name,
                email=email,
                password=None,
                role=role,
                profile_picture=profile_picture,
                auth_provider="google"
            )

            db.add(user)
            db.commit()
            db.refresh(user)

        token = create_access_token({
            "sub": user.email
        })

        return {
            "message": "Google login successful",
            "token": token,
            "user": user_to_dict(user)
        }

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Google login failed"
        )