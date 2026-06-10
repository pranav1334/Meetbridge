from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_

from database import get_db
from models import User, JoinRequest, MeetupRegistration
from auth import get_current_user

router = APIRouter(prefix="/api/members", tags=["Members"])


def is_approved_member(db: Session, user_id: int, community_id: int):
    approved = db.query(JoinRequest).filter(
        JoinRequest.user_id == user_id,
        JoinRequest.community_id == community_id,
        JoinRequest.status == "approved"
    ).first()

    return approved is not None


def has_common_approved_community(db: Session, user1_id: int, user2_id: int):
    user1_communities = db.query(JoinRequest.community_id).filter(
        JoinRequest.user_id == user1_id,
        JoinRequest.status == "approved"
    ).subquery()

    common = db.query(JoinRequest).filter(
        JoinRequest.user_id == user2_id,
        JoinRequest.status == "approved",
        JoinRequest.community_id.in_(user1_communities)
    ).first()

    return common is not None


@router.get("/")
def get_all_members_for_admin(
    search: str = "",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admin can view all members")

    query = db.query(User)

    if search:
        query = query.filter(
            or_(
                User.full_name.ilike(f"%{search}%"),
                User.email.ilike(f"%{search}%"),
                User.profession.ilike(f"%{search}%"),
                User.company_college.ilike(f"%{search}%"),
                User.city.ilike(f"%{search}%")
            )
        )

    members = query.order_by(User.id.desc()).all()

    return [
        {
            "id": member.id,
            "full_name": member.full_name,
            "email": member.email,
            "role": member.role,
            "profile_picture": member.profile_picture,
            "profession": member.profession,
            "company_college": member.company_college,
            "city": member.city,
            "bio": member.bio,
            "looking_for": member.looking_for,
            "can_help_with": member.can_help_with,
        }
        for member in members
    ]


@router.get("/community/{community_id}")
def get_community_members(
    community_id: int,
    search: str = "",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        allowed = is_approved_member(db, current_user.id, community_id)

        if not allowed:
            raise HTTPException(
                status_code=403,
                detail="Only approved community members can view this directory"
            )

    approved_requests = db.query(JoinRequest).filter(
        JoinRequest.community_id == community_id,
        JoinRequest.status == "approved"
    ).all()

    user_ids = [request.user_id for request in approved_requests]

    if not user_ids:
        return []

    query = db.query(User).filter(User.id.in_(user_ids))

    if search:
        query = query.filter(
            or_(
                User.full_name.ilike(f"%{search}%"),
                User.profession.ilike(f"%{search}%"),
                User.company_college.ilike(f"%{search}%"),
                User.city.ilike(f"%{search}%")
            )
        )

    members = query.order_by(User.id.desc()).all()

    return [
        {
            "id": member.id,
            "full_name": member.full_name,
            "email": member.email,
            "role": member.role,
            "profile_picture": member.profile_picture,
            "profession": member.profession,
            "company_college": member.company_college,
            "city": member.city,
            "bio": member.bio,
            "linkedin_url": member.linkedin_url,
            "instagram_url": member.instagram_url,
            "website_url": member.website_url,
            "looking_for": member.looking_for,
            "can_help_with": member.can_help_with,
        }
        for member in members
    ]


@router.get("/{user_id}")
def get_member_profile(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    member = db.query(User).filter(User.id == user_id).first()

    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    if current_user.role != "admin" and current_user.id != user_id:
        allowed = has_common_approved_community(db, current_user.id, user_id)

        if not allowed:
            raise HTTPException(
                status_code=403,
                detail="You can only view profiles of members from your approved communities"
            )

    attended_meetups = db.query(MeetupRegistration).filter(
        MeetupRegistration.user_id == user_id,
        MeetupRegistration.status == "checked_in"
    ).count()

    joined_communities = db.query(JoinRequest).filter(
        JoinRequest.user_id == user_id,
        JoinRequest.status == "approved"
    ).count()

    return {
        "id": member.id,
        "full_name": member.full_name,
        "email": member.email,
        "role": member.role,
        "profile_picture": member.profile_picture,
        "profession": member.profession,
        "company_college": member.company_college,
        "city": member.city,
        "bio": member.bio,
        "linkedin_url": member.linkedin_url,
        "instagram_url": member.instagram_url,
        "website_url": member.website_url,
        "looking_for": member.looking_for,
        "can_help_with": member.can_help_with,
        "joined_communities": joined_communities,
        "meetups_attended": attended_meetups
    }