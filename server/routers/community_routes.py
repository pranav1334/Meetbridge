from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Community, User
from schemas import CommunityCreate
from auth import get_current_user, admin_required

router = APIRouter(prefix="/api/communities", tags=["Communities"])


@router.get("/")
def get_all_communities(
    search: str = "",
    category: str = "",
    city: str = "",
    db: Session = Depends(get_db)
):
    query = db.query(Community)

    if search:
        query = query.filter(Community.name.ilike(f"%{search}%"))

    if category:
        query = query.filter(Community.category.ilike(f"%{category}%"))

    if city:
        query = query.filter(Community.city.ilike(f"%{city}%"))

    communities = query.order_by(Community.id.desc()).all()

    return communities


@router.get("/{community_id}")
def get_community(community_id: int, db: Session = Depends(get_db)):
    community = db.query(Community).filter(Community.id == community_id).first()

    if not community:
        raise HTTPException(status_code=404, detail="Community not found")

    return community


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
        "community": new_community
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
        "community": db_community
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

    return {"message": "Community deleted successfully"}