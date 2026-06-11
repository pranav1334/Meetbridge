from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from database import get_db
from models import (
    User,
    Community,
    Meetup,
    MeetupRegistration,
    Attendance,
)
from auth import get_current_user, admin_required

router = APIRouter(prefix="/api/meetups", tags=["Meetups"])


def meetup_to_dict(db: Session, meetup: Meetup):
    community = db.query(Community).filter(
        Community.id == meetup.community_id
    ).first()

    registered_count = db.query(MeetupRegistration).filter(
        MeetupRegistration.meetup_id == meetup.id
    ).count()

    checked_in_count = db.query(Attendance).filter(
        Attendance.meetup_id == meetup.id
    ).count()

    return {
        "id": meetup.id,
        "community_id": meetup.community_id,
        "community_name": community.name if community else "Unknown Community",
        "title": meetup.title,
        "banner": meetup.banner,
        "description": meetup.description,
        "date": meetup.date,
        "start_time": meetup.start_time,
        "end_time": meetup.end_time,
        "venue_name": meetup.venue_name,
        "google_maps_link": meetup.google_maps_link,
        "capacity_limit": meetup.capacity_limit,
        "registration_deadline": meetup.registration_deadline,
        "created_by": meetup.created_by,
        "created_at": meetup.created_at,
        "registered_count": registered_count,
        "checked_in_count": checked_in_count,
        "total_registrations": registered_count,
        "total_checkins": checked_in_count,
    }


@router.get("/")
def get_meetups(db: Session = Depends(get_db)):
    meetups = db.query(Meetup).order_by(Meetup.id.desc()).all()

    return [
        meetup_to_dict(db, meetup)
        for meetup in meetups
    ]


@router.get("/{meetup_id}")
def get_meetup(
    meetup_id: int,
    db: Session = Depends(get_db)
):
    meetup = db.query(Meetup).filter(
        Meetup.id == meetup_id
    ).first()

    if not meetup:
        raise HTTPException(status_code=404, detail="Meetup not found")

    return meetup_to_dict(db, meetup)


@router.post("/")
def create_meetup(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required)
):
    required_fields = [
        "community_id",
        "title",
        "description",
        "date",
        "start_time",
        "end_time",
        "venue_name",
        "capacity_limit",
    ]

    for field in required_fields:
        if data.get(field) in [None, ""]:
            raise HTTPException(
                status_code=400,
                detail=f"{field} is required"
            )

    community = db.query(Community).filter(
        Community.id == int(data.get("community_id"))
    ).first()

    if not community:
        raise HTTPException(status_code=404, detail="Community not found")

    meetup = Meetup(
        community_id=int(data.get("community_id")),
        title=data.get("title"),
        banner=data.get("banner"),
        description=data.get("description"),
        date=data.get("date"),
        start_time=data.get("start_time"),
        end_time=data.get("end_time"),
        venue_name=data.get("venue_name"),
        google_maps_link=data.get("google_maps_link"),
        capacity_limit=int(data.get("capacity_limit")),
        registration_deadline=data.get("registration_deadline"),
        created_by=current_user.id,
    )

    db.add(meetup)
    db.commit()
    db.refresh(meetup)

    return {
        "message": "Meetup created successfully",
        "meetup": meetup_to_dict(db, meetup),
    }


@router.put("/{meetup_id}")
def update_meetup(
    meetup_id: int,
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required)
):
    meetup = db.query(Meetup).filter(
        Meetup.id == meetup_id
    ).first()

    if not meetup:
        raise HTTPException(status_code=404, detail="Meetup not found")

    if data.get("community_id"):
        community = db.query(Community).filter(
            Community.id == int(data.get("community_id"))
        ).first()

        if not community:
            raise HTTPException(status_code=404, detail="Community not found")

        meetup.community_id = int(data.get("community_id"))

    meetup.title = data.get("title", meetup.title)
    meetup.banner = data.get("banner", meetup.banner)
    meetup.description = data.get("description", meetup.description)
    meetup.date = data.get("date", meetup.date)
    meetup.start_time = data.get("start_time", meetup.start_time)
    meetup.end_time = data.get("end_time", meetup.end_time)
    meetup.venue_name = data.get("venue_name", meetup.venue_name)
    meetup.google_maps_link = data.get(
        "google_maps_link",
        meetup.google_maps_link
    )

    if data.get("capacity_limit") not in [None, ""]:
        meetup.capacity_limit = int(data.get("capacity_limit"))

    meetup.registration_deadline = data.get(
        "registration_deadline",
        meetup.registration_deadline
    )

    db.commit()
    db.refresh(meetup)

    return {
        "message": "Meetup updated successfully",
        "meetup": meetup_to_dict(db, meetup),
    }


@router.patch("/{meetup_id}")
def patch_meetup(
    meetup_id: int,
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required)
):
    return update_meetup(meetup_id, data, db, current_user)


@router.delete("/{meetup_id}")
def delete_meetup(
    meetup_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required)
):
    meetup = db.query(Meetup).filter(
        Meetup.id == meetup_id
    ).first()

    if not meetup:
        raise HTTPException(status_code=404, detail="Meetup not found")

    db.query(Attendance).filter(
        Attendance.meetup_id == meetup_id
    ).delete(synchronize_session=False)

    db.query(MeetupRegistration).filter(
        MeetupRegistration.meetup_id == meetup_id
    ).delete(synchronize_session=False)

    db.delete(meetup)
    db.commit()

    return {
        "message": "Meetup, registrations, and attendance records deleted successfully"
    }


@router.post("/{meetup_id}/register")
def register_for_meetup(
    meetup_id: int,
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    meetup = db.query(Meetup).filter(
        Meetup.id == meetup_id
    ).first()

    if not meetup:
        raise HTTPException(status_code=404, detail="Meetup not found")

    existing = db.query(MeetupRegistration).filter(
        MeetupRegistration.meetup_id == meetup_id,
        MeetupRegistration.user_id == current_user.id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="You already registered for this meetup"
        )

    registered_count = db.query(MeetupRegistration).filter(
        MeetupRegistration.meetup_id == meetup_id
    ).count()

    if registered_count >= meetup.capacity_limit:
        raise HTTPException(
            status_code=400,
            detail="Meetup capacity is full"
        )

    registration = MeetupRegistration(
        meetup_id=meetup_id,
        user_id=current_user.id,
        reason=data.get("reason"),
        want_to_learn=data.get("want_to_learn"),
        contribution=data.get("contribution"),
        status="registered",
    )

    db.add(registration)
    db.commit()
    db.refresh(registration)

    return {
        "message": "Registered for meetup successfully",
        "registration": {
            "id": registration.id,
            "meetup_id": registration.meetup_id,
            "user_id": registration.user_id,
            "reason": registration.reason,
            "want_to_learn": registration.want_to_learn,
            "contribution": registration.contribution,
            "status": registration.status,
        }
    }


@router.post("/{meetup_id}/check-in")
def check_in_meetup(
    meetup_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    meetup = db.query(Meetup).filter(
        Meetup.id == meetup_id
    ).first()

    if not meetup:
        raise HTTPException(status_code=404, detail="Meetup not found")

    registration = db.query(MeetupRegistration).filter(
        MeetupRegistration.meetup_id == meetup_id,
        MeetupRegistration.user_id == current_user.id
    ).first()

    if not registration:
        raise HTTPException(
            status_code=400,
            detail="You must register before check-in"
        )

    existing_attendance = db.query(Attendance).filter(
        Attendance.meetup_id == meetup_id,
        Attendance.user_id == current_user.id
    ).first()

    if existing_attendance:
        raise HTTPException(
            status_code=400,
            detail="You already checked in"
        )

    attendance = Attendance(
        meetup_id=meetup_id,
        user_id=current_user.id,
        status="checked_in",
        check_in_time=datetime.utcnow(),
    )

    db.add(attendance)
    db.commit()
    db.refresh(attendance)

    return {
        "message": "Checked in successfully",
        "attendance": {
            "id": attendance.id,
            "meetup_id": attendance.meetup_id,
            "user_id": attendance.user_id,
            "status": attendance.status,
            "check_in_time": attendance.check_in_time,
        }
    }


@router.get("/{meetup_id}/analytics")
def meetup_analytics(
    meetup_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required)
):
    meetup = db.query(Meetup).filter(
        Meetup.id == meetup_id
    ).first()

    if not meetup:
        raise HTTPException(status_code=404, detail="Meetup not found")

    registrations = db.query(MeetupRegistration).filter(
        MeetupRegistration.meetup_id == meetup_id
    ).all()

    attendance = db.query(Attendance).filter(
        Attendance.meetup_id == meetup_id
    ).all()

    registration_data = []

    for reg in registrations:
        user = db.query(User).filter(User.id == reg.user_id).first()

        registration_data.append({
            "id": reg.id,
            "user_id": reg.user_id,
            "user_name": user.full_name if user else "Unknown User",
            "user_email": user.email if user else "",
            "reason": reg.reason,
            "want_to_learn": reg.want_to_learn,
            "contribution": reg.contribution,
            "status": reg.status,
            "created_at": reg.created_at,
        })

    attendance_data = []

    for item in attendance:
        user = db.query(User).filter(User.id == item.user_id).first()

        attendance_data.append({
            "id": item.id,
            "user_id": item.user_id,
            "user_name": user.full_name if user else "Unknown User",
            "user_email": user.email if user else "",
            "status": item.status,
            "check_in_time": item.check_in_time,
        })

    return {
        "meetup": meetup_to_dict(db, meetup),
        "total_registrations": len(registrations),
        "total_checkins": len(attendance),
        "registrations": registration_data,
        "attendance": attendance_data,
    }