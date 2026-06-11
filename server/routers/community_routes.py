from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from database import get_db
from models import (
    User,
    Community,
    JoinRequest,
    Meetup,
    MeetupRegistration,
    Attendance,
    Message,
)
from auth import get_current_user, admin_required

router = APIRouter(prefix="/api/communities", tags=["Communities"])


def community_to_dict(db: Session, community: Community):
    approved_members = db.query(JoinRequest).filter(
        JoinRequest.community_id == community.id,
        JoinRequest.status == "approved"
    ).count()

    meetup_count = db.query(Meetup).filter(
        Meetup.community_id == community.id
    ).count()

    return {
        "id": community.id,
        "name": community.name,
        "logo": community.logo,
        "cover_image": community.cover_image,
        "description": community.description,
        "category": community.category,
        "city": community.city,
        "website": community.website,
        "whatsapp_link": community.whatsapp_link,
        "discord_link": community.discord_link,
        "instagram_link": community.instagram_link,
        "rules": community.rules,
        "approval_type": community.approval_type,
        "created_by": community.created_by,
        "created_at": community.created_at,
        "member_count": approved_members,
        "upcoming_meetup_count": meetup_count,
    }


@router.get("/")
def get_communities(db: Session = Depends(get_db)):
    communities = db.query(Community).order_by(Community.id.desc()).all()

    return [
        community_to_dict(db, community)
        for community in communities
    ]


@router.get("/{community_id}")
def get_community(
    community_id: int,
    db: Session = Depends(get_db)
):
    community = db.query(Community).filter(
        Community.id == community_id
    ).first()

    if not community:
        raise HTTPException(status_code=404, detail="Community not found")

    return community_to_dict(db, community)


@router.post("/")
def create_community(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required)
):
    name = data.get("name")
    description = data.get("description")
    category = data.get("category")
    city = data.get("city")

    if not name or not description or not category or not city:
        raise HTTPException(
            status_code=400,
            detail="Name, description, category, and city are required"
        )

    community = Community(
        name=name,
        logo=data.get("logo"),
        cover_image=data.get("cover_image"),
        description=description,
        category=category,
        city=city,
        website=data.get("website"),
        whatsapp_link=data.get("whatsapp_link"),
        discord_link=data.get("discord_link"),
        instagram_link=data.get("instagram_link"),
        rules=data.get("rules"),
        approval_type=data.get("approval_type") or "admin",
        created_by=current_user.id,
    )

    db.add(community)
    db.commit()
    db.refresh(community)

    return {
        "message": "Community created successfully",
        "community": community_to_dict(db, community),
    }


@router.put("/{community_id}")
def update_community(
    community_id: int,
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required)
):
    community = db.query(Community).filter(
        Community.id == community_id
    ).first()

    if not community:
        raise HTTPException(status_code=404, detail="Community not found")

    community.name = data.get("name", community.name)
    community.logo = data.get("logo", community.logo)
    community.cover_image = data.get("cover_image", community.cover_image)
    community.description = data.get("description", community.description)
    community.category = data.get("category", community.category)
    community.city = data.get("city", community.city)
    community.website = data.get("website", community.website)
    community.whatsapp_link = data.get("whatsapp_link", community.whatsapp_link)
    community.discord_link = data.get("discord_link", community.discord_link)
    community.instagram_link = data.get("instagram_link", community.instagram_link)
    community.rules = data.get("rules", community.rules)
    community.approval_type = data.get("approval_type", community.approval_type)

    db.commit()
    db.refresh(community)

    return {
        "message": "Community updated successfully",
        "community": community_to_dict(db, community),
    }


@router.patch("/{community_id}")
def patch_community(
    community_id: int,
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required)
):
    return update_community(community_id, data, db, current_user)


@router.delete("/{community_id}")
def delete_community(
    community_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required)
):
    community = db.query(Community).filter(
        Community.id == community_id
    ).first()

    if not community:
        raise HTTPException(status_code=404, detail="Community not found")

    meetups = db.query(Meetup).filter(
        Meetup.community_id == community_id
    ).all()

    meetup_ids = [meetup.id for meetup in meetups]

    if meetup_ids:
        db.query(Attendance).filter(
            Attendance.meetup_id.in_(meetup_ids)
        ).delete(synchronize_session=False)

        db.query(MeetupRegistration).filter(
            MeetupRegistration.meetup_id.in_(meetup_ids)
        ).delete(synchronize_session=False)

        db.query(Meetup).filter(
            Meetup.id.in_(meetup_ids)
        ).delete(synchronize_session=False)

    db.query(Message).filter(
        Message.community_id == community_id
    ).delete(synchronize_session=False)

    db.query(JoinRequest).filter(
        JoinRequest.community_id == community_id
    ).delete(synchronize_session=False)

    db.delete(community)
    db.commit()

    return {
        "message": "Community and related data deleted successfully"
    }