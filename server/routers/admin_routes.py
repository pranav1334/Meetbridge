from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import User, Community, JoinRequest, Meetup, MeetupRegistration, Attendance
from auth import admin_required

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/dashboard")
def admin_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required)
):
    total_users = db.query(User).count()
    total_communities = db.query(Community).count()
    total_join_requests = db.query(JoinRequest).count()
    pending_requests = db.query(JoinRequest).filter(JoinRequest.status == "pending").count()
    approved_requests = db.query(JoinRequest).filter(JoinRequest.status == "approved").count()
    total_meetups = db.query(Meetup).count()
    total_registrations = db.query(MeetupRegistration).count()
    total_checkins = db.query(Attendance).count()

    return {
        "total_users": total_users,
        "total_communities": total_communities,
        "total_join_requests": total_join_requests,
        "pending_requests": pending_requests,
        "approved_requests": approved_requests,
        "total_meetups": total_meetups,
        "total_registrations": total_registrations,
        "total_checkins": total_checkins
    }


@router.get("/members")
def get_all_members(
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required)
):
    members = db.query(User).order_by(User.id.desc()).all()
    return members