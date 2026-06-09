from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)

    role = Column(String(20), default="member")  # admin or member

    profile_picture = Column(String(500), nullable=True)
    profession = Column(String(150), nullable=True)
    company_college = Column(String(150), nullable=True)
    city = Column(String(100), nullable=True)
    bio = Column(Text, nullable=True)
    linkedin_url = Column(String(500), nullable=True)
    instagram_url = Column(String(500), nullable=True)
    website_url = Column(String(500), nullable=True)

    looking_for = Column(Text, nullable=True)
    can_help_with = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    join_requests = relationship("JoinRequest", back_populates="user")
    meetup_registrations = relationship("MeetupRegistration", back_populates="user")
    attendance_records = relationship("Attendance", back_populates="user")


class Community(Base):
    __tablename__ = "communities"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(150), nullable=False)
    logo = Column(String(500), nullable=True)
    cover_image = Column(String(500), nullable=True)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)
    city = Column(String(100), nullable=False)

    website = Column(String(500), nullable=True)
    whatsapp_link = Column(String(500), nullable=True)
    discord_link = Column(String(500), nullable=True)
    instagram_link = Column(String(500), nullable=True)

    rules = Column(Text, nullable=True)
    approval_type = Column(String(50), default="admin")  # auto or admin

    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    join_requests = relationship("JoinRequest", back_populates="community")
    meetups = relationship("Meetup", back_populates="community")


class JoinRequest(Base):
    __tablename__ = "join_requests"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    community_id = Column(Integer, ForeignKey("communities.id"), nullable=False)

    reason = Column(Text, nullable=False)
    contribution = Column(Text, nullable=False)

    status = Column(String(50), default="pending")  # pending, approved, rejected

    ai_score = Column(Integer, nullable=True)
    ai_decision = Column(String(100), nullable=True)
    ai_spam_risk = Column(String(100), nullable=True)
    ai_reason_summary = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="join_requests")
    community = relationship("Community", back_populates="join_requests")


class Meetup(Base):
    __tablename__ = "meetups"

    id = Column(Integer, primary_key=True, index=True)

    community_id = Column(Integer, ForeignKey("communities.id"), nullable=False)

    title = Column(String(200), nullable=False)
    banner = Column(String(500), nullable=True)
    description = Column(Text, nullable=False)

    date = Column(String(50), nullable=False)
    start_time = Column(String(50), nullable=False)
    end_time = Column(String(50), nullable=False)

    venue_name = Column(String(200), nullable=False)
    google_maps_link = Column(String(500), nullable=True)

    capacity_limit = Column(Integer, default=100)
    registration_deadline = Column(String(50), nullable=True)

    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    community = relationship("Community", back_populates="meetups")
    registrations = relationship("MeetupRegistration", back_populates="meetup")
    attendance_records = relationship("Attendance", back_populates="meetup")


class MeetupRegistration(Base):
    __tablename__ = "meetup_registrations"

    id = Column(Integer, primary_key=True, index=True)

    meetup_id = Column(Integer, ForeignKey("meetups.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    reason = Column(Text, nullable=False)
    want_to_learn = Column(Text, nullable=False)
    contribution = Column(Text, nullable=False)

    status = Column(String(50), default="registered")

    created_at = Column(DateTime, default=datetime.utcnow)

    meetup = relationship("Meetup", back_populates="registrations")
    user = relationship("User", back_populates="meetup_registrations")


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)

    meetup_id = Column(Integer, ForeignKey("meetups.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    status = Column(String(50), default="checked_in")
    check_in_time = Column(DateTime, default=datetime.utcnow)

    meetup = relationship("Meetup", back_populates="attendance_records")
    user = relationship("User", back_populates="attendance_records")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)

    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    community_id = Column(Integer, ForeignKey("communities.id"), nullable=True)

    message_type = Column(String(50), default="direct")  # direct, general, opportunity, announcement
    content = Column(Text, nullable=False)

    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)