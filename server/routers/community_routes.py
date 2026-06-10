from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models import Community, User, JoinRequest, Meetup
from schemas import CommunityCreate
from auth import admin_required

router = APIRouter(prefix="/api/communities", tags=["Communities"])


def community_to_dict(db: Session, community: Community):
    member_count = db.query(JoinRequest).filter(
        JoinRequest.community_id == community.id,
        JoinRequest.status == "approved"
    ).count()

    upcoming_meetup_count = db.query(Meetup).filter(
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
        "member_count": member_count,
        "upcoming_meetup_count": upcoming_meetup_count
    }


@router.get("/")
def get_all_communities(
    search: str = "",
    category: str = "",
    city: str = "",
    sort: str = "newest",
    db: Session = Depends(get_db)
):
    query = db.query(Community)

    if search:
        query = query.filter(Community.name.ilike(f"%{search}%"))

    if category:
        query = query.filter(Community.category.ilike(f"%{category}%"))

    if city:
        query = query.filter(Community.city.ilike(f"%{city}%"))

    communities = query.all()

    result = [community_to_dict(db, community) for community in communities]

    if sort == "member_count":
        result.sort(key=lambda item: item["member_count"], reverse=True)
    elif sort == "meetup_count":
        result.sort(key=lambda item: item["upcoming_meetup_count"], reverse=True)
    else:
        result.sort(key=lambda item: item["id"], reverse=True)

    return result


@router.get("/{community_id}")
def get_community(community_id: int, db: Session = Depends(get_db)):
    community = db.query(Community).filter(Community.id == community_id).first()

    if not community:
        raise HTTPException(status_code=404, detail="Community not found")

    return community_to_dict(db, community)


@router.post("/")
def create_community(
    community: CommunityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required)
):
    new_community = Community(
        name=community.name,
        logo=community.logo,
        cover_image=community.cover_image,
        description=community.description,
        category=community.category,
        city=community.city,
        website=community.website,
        whatsapp_link=community.whatsapp_link,
        discord_link=community.discord_link,
        instagram_link=community.instagram_link,
        rules=community.rules,
        approval_type=community.approval_type,
        created_by=current_user.id
    )

    db.add(new_community)
    db.commit()
    db.refresh(new_community)

    return {
        "message": "Community created successfully",
        "community": community_to_dict(db, new_community)
    }


@router.put("/{community_id}")
def update_community(
    community_id: int,
    community: CommunityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required)
):
    db_community = db.query(Community).filter(Community.id == community_id).first()

    if not db_community:
        raise HTTPException(status_code=404, detail="Community not found")

    db_community.name = community.name
    db_community.logo = community.logo
    db_community.cover_image = community.cover_image
    db_community.description = community.description
    db_community.category = community.category
    db_community.city = community.city
    db_community.website = community.website
    db_community.whatsapp_link = community.whatsapp_link
    db_community.discord_link = community.discord_link
    db_community.instagram_link = community.instagram_link
    db_community.rules = community.rules
    db_community.approval_type = community.approval_type

    db.commit()
    db.refresh(db_community)

    return {
        "message": "Community updated successfully",
        "community": community_to_dict(db, db_community)
    }


@router.delete("/{community_id}")
def delete_community(
    community_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required)
):
    community = db.query(Community).filter(Community.id == community_id).first()

    if not community:
        raise HTTPException(status_code=404, detail="Community not found")

    db.delete(community)
    db.commit()

    return {
        "message": "Community deleted successfully"
    }


@router.get("/{community_id}/analytics")
def community_analytics(
    community_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required)
):
    community = db.query(Community).filter(Community.id == community_id).first()

    if not community:
        raise HTTPException(status_code=404, detail="Community not found")

    total_requests = db.query(JoinRequest).filter(
        JoinRequest.community_id == community_id
    ).count()

    approved_members = db.query(JoinRequest).filter(
        JoinRequest.community_id == community_id,
        JoinRequest.status == "approved"
    ).count()

    pending_requests = db.query(JoinRequest).filter(
        JoinRequest.community_id == community_id,
        JoinRequest.status == "pending"
    ).count()

    rejected_requests = db.query(JoinRequest).filter(
        JoinRequest.community_id == community_id,
        JoinRequest.status == "rejected"
    ).count()

    total_meetups = db.query(Meetup).filter(
        Meetup.community_id == community_id
    ).count()

    return {
        "community_id": community.id,
        "community_name": community.name,
        "total_requests": total_requests,
        "approved_members": approved_members,
        "pending_requests": pending_requests,
        "rejected_requests": rejected_requests,
        "total_meetups": total_meetups
    }