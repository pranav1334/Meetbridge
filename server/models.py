from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from datetime import datetime

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=True)

    role = Column(String, default="member")

    profile_picture = Column(String, nullable=True)
    profession = Column(String, nullable=True)
    company_college = Column(String, nullable=True)
    city = Column(String, nullable=True)
    bio = Column(Text, nullable=True)

    linkedin_url = Column(String, nullable=True)
    instagram_url = Column(String, nullable=True)
    website_url = Column(String, nullable=True)

    looking_for = Column(Text, nullable=True)
    can_help_with = Column(Text, nullable=True)

    auth_provider = Column(String, default="local")

    created_at = Column(DateTime, default=datetime.utcnow)


class Community(Base):
    __tablename__ = "communities"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)
    logo = Column(String, nullable=True)
    cover_image = Column(String, nullable=True)

    description = Column(Text, nullable=False)
    category = Column(String, nullable=False)
    city = Column(String, nullable=False)

    website = Column(String, nullable=True)
    whatsapp_link = Column(String, nullable=True)
    discord_link = Column(String, nullable=True)
    instagram_link = Column(String, nullable=True)

    rules = Column(Text, nullable=True)

    approval_type = Column(String, default="admin")

    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)


class JoinRequest(Base):
    __tablename__ = "join_requests"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    community_id = Column(Integer, ForeignKey("communities.id"), nullable=False)

    reason = Column(Text, nullable=False)
    contribution = Column(Text, nullable=False)

    status = Column(String, default="pending")

    ai_score = Column(Integer, nullable=True)
    ai_decision = Column(String, nullable=True)
    ai_summary = Column(Text, nullable=True)
    ai_spam_risk = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)


class Meetup(Base):
    __tablename__ = "meetups"

    id = Column(Integer, primary_key=True, index=True)

    community_id = Column(Integer, ForeignKey("communities.id"), nullable=False)

    title = Column(String, nullable=False)
    banner = Column(String, nullable=True)
    description = Column(Text, nullable=False)

    date = Column(String, nullable=False)
    start_time = Column(String, nullable=False)
    end_time = Column(String, nullable=False)

    venue_name = Column(String, nullable=False)
    google_maps_link = Column(String, nullable=True)

    capacity_limit = Column(Integer, nullable=False)
    registration_deadline = Column(String, nullable=True)

    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)


class MeetupRegistration(Base):
    __tablename__ = "meetup_registrations"

    id = Column(Integer, primary_key=True, index=True)

    meetup_id = Column(Integer, ForeignKey("meetups.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    reason = Column(Text, nullable=True)
    want_to_learn = Column(Text, nullable=True)
    contribution = Column(Text, nullable=True)

    status = Column(String, default="registered")

    created_at = Column(DateTime, default=datetime.utcnow)


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)

    meetup_id = Column(Integer, ForeignKey("meetups.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    status = Column(String, default="checked_in")

    check_in_time = Column(DateTime, default=datetime.utcnow)


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)

    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    community_id = Column(Integer, ForeignKey("communities.id"), nullable=True)

    message_type = Column(String, default="direct")
    # direct, general, opportunity, announcement

    content = Column(Text, nullable=False)

    is_read = Column(Boolean, default=False)
    is_pinned = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)
    is_reported = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)

    notification_type = Column(String, default="info")
    target_url = Column(String, nullable=True)

    is_read = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)