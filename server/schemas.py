from pydantic import BaseModel, EmailStr
from typing import Optional


class RegisterUser(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    profession: Optional[str] = None
    company_college: Optional[str] = None
    city: Optional[str] = None
    bio: Optional[str] = None
    linkedin_url: Optional[str] = None
    looking_for: Optional[str] = None
    can_help_with: Optional[str] = None


class LoginUser(BaseModel):
    email: EmailStr
    password: str


class GoogleLoginRequest(BaseModel):
    credential: str


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    profession: Optional[str] = None
    company_college: Optional[str] = None
    city: Optional[str] = None
    bio: Optional[str] = None
    linkedin_url: Optional[str] = None
    looking_for: Optional[str] = None
    can_help_with: Optional[str] = None

    class Config:
        from_attributes = True


class CommunityCreate(BaseModel):
    name: str
    logo: Optional[str] = None
    cover_image: Optional[str] = None
    description: str
    category: str
    city: str
    website: Optional[str] = None
    whatsapp_link: Optional[str] = None
    discord_link: Optional[str] = None
    instagram_link: Optional[str] = None
    rules: Optional[str] = None
    approval_type: Optional[str] = "admin"


class CommunityResponse(BaseModel):
    id: int
    name: str
    logo: Optional[str] = None
    cover_image: Optional[str] = None
    description: str
    category: str
    city: str
    website: Optional[str] = None
    whatsapp_link: Optional[str] = None
    discord_link: Optional[str] = None
    instagram_link: Optional[str] = None
    rules: Optional[str] = None
    approval_type: str

    class Config:
        from_attributes = True


class JoinRequestCreate(BaseModel):
    community_id: int
    reason: str
    contribution: str


class JoinRequestResponse(BaseModel):
    id: int
    user_id: int
    community_id: int
    reason: str
    contribution: str
    status: str
    ai_score: Optional[int] = None
    ai_decision: Optional[str] = None
    ai_spam_risk: Optional[str] = None
    ai_reason_summary: Optional[str] = None

    class Config:
        from_attributes = True


class MeetupCreate(BaseModel):
    community_id: int
    title: str
    banner: Optional[str] = None
    description: str
    date: str
    start_time: str
    end_time: str
    venue_name: str
    google_maps_link: Optional[str] = None
    capacity_limit: int = 100
    registration_deadline: Optional[str] = None


class MeetupResponse(BaseModel):
    id: int
    community_id: int
    title: str
    banner: Optional[str] = None
    description: str
    date: str
    start_time: str
    end_time: str
    venue_name: str
    google_maps_link: Optional[str] = None
    capacity_limit: int
    registration_deadline: Optional[str] = None

    class Config:
        from_attributes = True


class MeetupRegisterCreate(BaseModel):
    meetup_id: int
    reason: str
    want_to_learn: str
    contribution: str


class AIProfileImproveRequest(BaseModel):
    bio: str
    looking_for: str
    can_help_with: str


class AIChatRequest(BaseModel):
    message: str