from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Meetup, MeetupRegistration, Attendance, JoinRequest, User
from schemas import MeetupCreate, MeetupRegisterCreate
from auth import get_current_user, admin_required

router = APIRouter(prefix="/api/meetups", tags=["Meetups"])


@router.get("/")
def get_all_meetups(db: Session = Depends(get_db)):
    meetups = db.query(Meetup).order_by(Meetup.id.desc()).all()
    return meetups


@router.get("/{meetup_id}")
def get_meetup(meetup_id: int, db: Session = Depends(get_db)):
    meetup = db.query(Meetup).filter(Meetup.id == meetup_id).first()

    if not meetup:
        raise HTTPException(status_code=404, detail="Meetup not found")

    return meetup


@router.post("/")
def create_meetup(
    meetup: MeetupCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required)
):
    new_meetup = Meetup(
        community_id=meetup.community_id,
        title=meetup.title,
        banner=meetup.banner,
        description=meetup.description,
        date=meetup.date,
        start_time=meetup.start_time,
        end_time=meetup.end_time,
        venue_name=meetup.venue_name,
        google_maps_link=meetup.google_maps_link,
        capacity_limit=meetup.capacity_limit,
        registration_deadline=meetup.registration_deadline,
        created_by=current_user.id
    )

    db.add(new_meetup)
    db.commit()
    db.refresh(new_meetup)

    return {
        "message": "Meetup created successfully",
        "meetup": new_meetup
    }


@router.put("/{meetup_id}")
def update_meetup(
    meetup_id: int,
    meetup: MeetupCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required)
):
    db_meetup = db.query(Meetup).filter(Meetup.id == meetup_id).first()

    if not db_meetup:
        raise HTTPException(status_code=404, detail="Meetup not found")

    db_meetup.community_id = meetup.community_id
    db_meetup.title = meetup.title
    db_meetup.banner = meetup.banner
    db_meetup.description = meetup.description
    db_meetup.date = meetup.date
    db_meetup.start_time = meetup.start_time
    db_meetup.end_time = meetup.end_time
    db_meetup.venue_name = meetup.venue_name
    db_meetup.google_maps_link = meetup.google_maps_link
    db_meetup.capacity_limit = meetup.capacity_limit
    db_meetup.registration_deadline = meetup.registration_deadline

    db.commit()
    db.refresh(db_meetup)

    return {
        "message": "Meetup updated successfully",
        "meetup": db_meetup
    }


@router.delete("/{meetup_id}")
def delete_meetup(
    meetup_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required)
):
    meetup = db.query(Meetup).filter(Meetup.id == meetup_id).first()

    if not meetup:
        raise HTTPException(status_code=404, detail="Meetup not found")

    db.delete(meetup)
    db.commit()

    return {"message": "Meetup deleted successfully"}


@router.post("/register")
def register_for_meetup(
    registration: MeetupRegisterCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    meetup = db.query(Meetup).filter(Meetup.id == registration.meetup_id).first()

    if not meetup:
        raise HTTPException(status_code=404, detail="Meetup not found")

    approved_member = db.query(JoinRequest).filter(
        JoinRequest.user_id == current_user.id,
        JoinRequest.community_id == meetup.community_id,
        JoinRequest.status == "approved"
    ).first()

    if not approved_member:
        raise HTTPException(
            status_code=403,
            detail="Only approved community members can register for this meetup"
        )

    existing_registration = db.query(MeetupRegistration).filter(
        MeetupRegistration.user_id == current_user.id,
        MeetupRegistration.meetup_id == registration.meetup_id
    ).first()

    if existing_registration:
        raise HTTPException(status_code=400, detail="Already registered for this meetup")

    new_registration = MeetupRegistration(
        meetup_id=registration.meetup_id,
        user_id=current_user.id,
        reason=registration.reason,
        want_to_learn=registration.want_to_learn,
        contribution=registration.contribution
    )

    db.add(new_registration)
    db.commit()
    db.refresh(new_registration)

    return {
        "message": "Meetup registration successful",
        "registration": new_registration
    }


@router.post("/{meetup_id}/check-in")
def check_in_meetup(
    meetup_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    registration = db.query(MeetupRegistration).filter(
        MeetupRegistration.user_id == current_user.id,
        MeetupRegistration.meetup_id == meetup_id
    ).first()

    if not registration:
        raise HTTPException(status_code=403, detail="You must register before check-in")

    existing_attendance = db.query(Attendance).filter(
        Attendance.user_id == current_user.id,
        Attendance.meetup_id == meetup_id
    ).first()

    if existing_attendance:
        raise HTTPException(status_code=400, detail="Already checked in")

    attendance = Attendance(
        user_id=current_user.id,
        meetup_id=meetup_id,
        status="checked_in"
    )

    registration.status = "checked_in"

    db.add(attendance)
    db.commit()
    db.refresh(attendance)

    return {
        "message": "Check-in successful",
        "attendance": attendance
    }


@router.get("/{meetup_id}/registrations")
def get_meetup_registrations(
    meetup_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required)
):
    registrations = db.query(MeetupRegistration).filter(
        MeetupRegistration.meetup_id == meetup_id
    ).all()

    return registrations


@router.get("/{meetup_id}/attendance")
def get_meetup_attendance(
    meetup_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required)
):
    registrations_count = db.query(MeetupRegistration).filter(
        MeetupRegistration.meetup_id == meetup_id
    ).count()

    checkins_count = db.query(Attendance).filter(
        Attendance.meetup_id == meetup_id
    ).count()

    attendance_percentage = 0

    if registrations_count > 0:
        attendance_percentage = round((checkins_count / registrations_count) * 100, 2)

    return {
        "total_registrations": registrations_count,
        "total_checkins": checkins_count,
        "attendance_percentage": attendance_percentage
    }