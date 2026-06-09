from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import JoinRequest, Community, User
from schemas import JoinRequestCreate
from auth import get_current_user, admin_required

router = APIRouter(prefix="/api/join-requests", tags=["Join Requests"])


def simple_ai_review(user: User, community: Community, reason: str, contribution: str):
    score = 0

    profile_fields = [
        user.full_name,
        user.email,
        user.profession,
        user.company_college,
        user.city,
        user.bio,
        user.linkedin_url
    ]

    completed = sum(1 for field in profile_fields if field)
    profile_score = int((completed / len(profile_fields)) * 20)
    score += profile_score

    relevance_score = 15
    if user.profession and community.category:
        if user.profession.lower() in community.category.lower() or community.category.lower() in user.profession.lower():
            relevance_score = 25
    score += relevance_score

    reason_score = 20 if len(reason.strip()) > 40 else 10
    contribution_score = 20 if len(contribution.strip()) > 40 else 10

    score += reason_score
    score += contribution_score

    spam_words = ["buy now", "click here", "free money", "promotion", "spam", "http://", "https://"]
    spam_found = any(word in reason.lower() or word in contribution.lower() for word in spam_words)

    if spam_found:
        safety_score = 5
        spam_risk = "High"
    else:
        safety_score = 15
        spam_risk = "Low"

    score += safety_score

    if score >= 80:
        decision = "Approve"
    elif score >= 60:
        decision = "Review"
    elif score >= 40:
        decision = "Ask more information"
    else:
        decision = "Reject suggestion"

    summary = f"User profile completeness score is {profile_score}/20. Reason quality is {reason_score}/20. Contribution quality is {contribution_score}/20. Spam risk is {spam_risk}."

    return {
        "score": min(score, 100),
        "decision": decision,
        "spam_risk": spam_risk,
        "summary": summary
    }


@router.post("/")
def send_join_request(
    request: JoinRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    community = db.query(Community).filter(Community.id == request.community_id).first()

    if not community:
        raise HTTPException(status_code=404, detail="Community not found")

    existing_request = db.query(JoinRequest).filter(
        JoinRequest.user_id == current_user.id,
        JoinRequest.community_id == request.community_id
    ).first()

    if existing_request:
        raise HTTPException(status_code=400, detail="You already sent a join request for this community")

    ai_result = simple_ai_review(
        current_user,
        community,
        request.reason,
        request.contribution
    )

    status = "pending"

    if community.approval_type == "auto":
        status = "approved"

    new_request = JoinRequest(
        user_id=current_user.id,
        community_id=request.community_id,
        reason=request.reason,
        contribution=request.contribution,
        status=status,
        ai_score=ai_result["score"],
        ai_decision=ai_result["decision"],
        ai_spam_risk=ai_result["spam_risk"],
        ai_reason_summary=ai_result["summary"]
    )

    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    return {
        "message": "Join request submitted successfully",
        "join_request": new_request
    }


@router.get("/my")
def my_join_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    requests = db.query(JoinRequest).filter(
        JoinRequest.user_id == current_user.id
    ).order_by(JoinRequest.id.desc()).all()

    return requests


@router.get("/admin/all")
def get_all_join_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required)
):
    requests = db.query(JoinRequest).order_by(JoinRequest.id.desc()).all()
    return requests


@router.put("/{request_id}/approve")
def approve_join_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required)
):
    join_request = db.query(JoinRequest).filter(JoinRequest.id == request_id).first()

    if not join_request:
        raise HTTPException(status_code=404, detail="Join request not found")

    join_request.status = "approved"

    db.commit()
    db.refresh(join_request)

    return {
        "message": "Join request approved",
        "join_request": join_request
    }


@router.put("/{request_id}/reject")
def reject_join_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required)
):
    join_request = db.query(JoinRequest).filter(JoinRequest.id == request_id).first()

    if not join_request:
        raise HTTPException(status_code=404, detail="Join request not found")

    join_request.status = "rejected"

    db.commit()
    db.refresh(join_request)

    return {
        "message": "Join request rejected",
        "join_request": join_request
    }