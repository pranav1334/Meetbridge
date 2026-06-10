from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import os

from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from database import Base, engine

from routers import auth_routes
from routers import community_routes
from routers import join_request_routes
from routers import meetup_routes
from routers import admin_routes
from routers import ai_routes
from routers import upload_routes
from routers import member_routes
from routers import message_routes
from routers import notification_routes

Base.metadata.create_all(bind=engine)

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="MeetBridge API")

app.state.limiter = limiter

os.makedirs("uploads", exist_ok=True)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

FRONTEND_URL = os.getenv("FRONTEND_URL", "")

allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

if FRONTEND_URL:
    allowed_origins.append(FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "*")

if ALLOWED_HOSTS == "*":
    allowed_hosts = ["*"]
else:
    allowed_hosts = [
        host.strip()
        for host in ALLOWED_HOSTS.split(",")
        if host.strip()
    ]

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=allowed_hosts,
)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)

    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"

    return response


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={
            "detail": "Too many requests. Please try again later."
        },
    )


app.include_router(auth_routes.router)
app.include_router(community_routes.router)
app.include_router(join_request_routes.router)
app.include_router(meetup_routes.router)
app.include_router(admin_routes.router)
app.include_router(ai_routes.router)
app.include_router(upload_routes.router)
app.include_router(member_routes.router)
app.include_router(message_routes.router)
app.include_router(notification_routes.router)


@app.get("/")
def home():
    return {
        "message": "MeetBridge backend is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "MeetBridge API"
    }