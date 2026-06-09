from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from database import Base, engine
from routers import auth_routes
from routers import community_routes
from routers import join_request_routes
from routers import meetup_routes
from routers import admin_routes
from routers import ai_routes
from routers import upload_routes

Base.metadata.create_all(bind=engine)

app = FastAPI(title="MeetBridge API")

os.makedirs("uploads", exist_ok=True)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(community_routes.router)
app.include_router(join_request_routes.router)
app.include_router(meetup_routes.router)
app.include_router(admin_routes.router)
app.include_router(ai_routes.router)
app.include_router(upload_routes.router)


@app.get("/")
def home():
    return {
        "message": "MeetBridge backend is running"
    }