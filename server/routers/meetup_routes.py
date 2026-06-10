from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from io import StringIO
import csv

from database import get_db
from models import Meetup, MeetupRegistration, Attendance, JoinRequest, User
from schemas import MeetupCreate, MeetupRegisterCreate
from auth import get_current_user, admin_required

router = APIRouter(prefix="/api/meetups", tags=["Meetups"])


def meetup_to_dict(meetup: Meetup, db: Session):
    registration_count = db.query(MeetupRegistration).filter(
        MeetupRegistration.meetup_id == meetup.id
    ).count()

    checkin_count = db.query(Attendance).filter(
        Attendance.meetup_id == meetup.id
    ).count()

    attendance_percentage = 0

    if registration_count > 0:
        attendance_percentage = round((checkin_count / registration_count) * 100, 2)

    return {
        "id": meetup.id,
        "community_id": meetup.community_id,
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
        "registration_count": registration_count,
        "checkin_count": checkin_count,
        "attendance_percentage": attendance_percentage
    }


@router.get("/")
def get_all_meetups(db: Session = Depends(get_db)):
    meetups = db.query(Meetup).order_by(Meetup.id.desc()).all()
    return [meetup_to_dict(meetup, db) for meetup in meetups]


@router.get("/{meetup_id}")
def get_meetup(meetup_id: int, db: Session = Depends(get_db)):
    meetup = db.query(Meetup).filter(Meetup.id == meetup_id).first()

    if not meetup:
        raise HTTPException(status_code=404, detail="Meetup not found")

    return meetup_to_dict(meetup, db)


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
        "meetup": meetup_to_dict(new_meetup, db)
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
        "meetup": meetup_to_dict(db_meetup, db)
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


@router.get("/{meetup_id}/registered-members")
def get_registered_members(
    meetup_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    meetup = db.query(Meetup).filter(Meetup.id == meetup_id).first()

    if not meetup:
        raise HTTPException(status_code=404, detail="Meetup not found")

    if current_user.role != "admin":
        user_registration = db.query(MeetupRegistration).filter(
            MeetupRegistration.meetup_id == meetup_id,
            MeetupRegistration.user_id == current_user.id
        ).first()

        if not user_registration:
            raise HTTPException(
                status_code=403,
                detail="Only registered attendees can view registered members"
            )

    registrations = db.query(MeetupRegistration).filter(
        MeetupRegistration.meetup_id == meetup_id
    ).all()

    result = []

    for reg in registrations:
        user = db.query(User).filter(User.id == reg.user_id).first()

        if user:
            result.append({
                "registration_id": reg.id,
                "user_id": user.id,
                "full_name": user.full_name,
                "profile_picture": user.profile_picture,
                "profession": user.profession,
                "company_college": user.company_college,
                "city": user.city,
                "looking_for": user.looking_for,
                "can_help_with": user.can_help_with,
                "reason": reg.reason,
                "want_to_learn": reg.want_to_learn,
                "contribution": reg.contribution,
                "status": reg.status
            })

    return result


@router.get("/{meetup_id}/checked-in-members")
def get_checked_in_members(
    meetup_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    meetup = db.query(Meetup).filter(Meetup.id == meetup_id).first()

    if not meetup:
        raise HTTPException(status_code=404, detail="Meetup not found")

    if current_user.role != "admin":
        user_attendance = db.query(Attendance).filter(
            Attendance.meetup_id == meetup_id,
            Attendance.user_id == current_user.id
        ).first()

        if not user_attendance:
            raise HTTPException(
                status_code=403,
                detail="Only checked-in attendees can view live attendee list"
            )

    attendance_records = db.query(Attendance).filter(
        Attendance.meetup_id == meetup_id
    ).all()

    result = []

    for record in attendance_records:
        user = db.query(User).filter(User.id == record.user_id).first()

        if user:
            result.append({
                "attendance_id": record.id,
                "user_id": user.id,
                "full_name": user.full_name,
                "profile_picture": user.profile_picture,
                "profession": user.profession,
                "company_college": user.company_college,
                "city": user.city,
                "looking_for": user.looking_for,
                "can_help_with": user.can_help_with,
                "check_in_time": record.check_in_time,
                "status": record.status
            })

    return {
        "count": len(result),
        "checked_in_members": result
    }


@router.get("/{meetup_id}/analytics")
def get_meetup_analytics(
    meetup_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required)
):
    meetup = db.query(Meetup).filter(Meetup.id == meetup_id).first()

    if not meetup:
        raise HTTPException(status_code=404, detail="Meetup not found")

    total_registrations = db.query(MeetupRegistration).filter(
        MeetupRegistration.meetup_id == meetup_id
    ).count()

    total_checkins = db.query(Attendance).filter(
        Attendance.meetup_id == meetup_id
    ).count()

    attendance_percentage = 0

    if total_registrations > 0:
        attendance_percentage = round((total_checkins / total_registrations) * 100, 2)

    most_active_members = db.query(User).join(
        Attendance,
        Attendance.user_id == User.id
    ).filter(
        Attendance.meetup_id == meetup_id
    ).all()

    return {
        "meetup_id": meetup.id,
        "meetup_title": meetup.title,
        "total_registrations": total_registrations,
        "total_checkins": total_checkins,
        "attendance_percentage": attendance_percentage,
        "most_active_members": [
            {
                "id": user.id,
                "full_name": user.full_name,
                "profession": user.profession,
                "city": user.city
            }
            for user in most_active_members
        ]
    }


@router.get("/{meetup_id}/export/attendees")
def export_attendees_csv(
    meetup_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required)
):
    attendance_records = db.query(Attendance).filter(
        Attendance.meetup_id == meetup_id
    ).all()

    output = StringIO()
    writer = csv.writer(output)

    writer.writerow([
        "User ID",
        "Full Name",
        "Email",
        "Profession",
        "Company / College",
        "City",
        "Check-in Time",
        "Status"
    ])

    for record in attendance_records:
        user = db.query(User).filter(User.id == record.user_id).first()

        if user:
            writer.writerow([
                user.id,
                user.full_name,
                user.email,
                user.profession,
                user.company_college,
                user.city,
                record.check_in_time,
                record.status
            ])

    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=meetup_{meetup_id}_attendees.csv"
        }
    )


@router.get("/{meetup_id}/export/responses")
def export_registration_responses_csv(
    meetup_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required)
):
    registrations = db.query(MeetupRegistration).filter(
        MeetupRegistration.meetup_id == meetup_id
    ).all()

    output = StringIO()
    writer = csv.writer(output)

    writer.writerow([
        "User ID",
        "Full Name",
        "Email",
        "Reason",
        "Want To Learn",
        "Contribution",
        "Registration Status"
    ])

    for reg in registrations:
        user = db.query(User).filter(User.id == reg.user_id).first()

        if user:
            writer.writerow([
                user.id,
                user.full_name,
                user.email,
                reg.reason,
                reg.want_to_learn,
                reg.contribution,
                reg.status
            ])

    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=meetup_{meetup_id}_responses.csv"
        }
    )