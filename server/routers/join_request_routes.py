from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import User, Community, JoinRequest
from auth import get_current_user, admin_required

router = APIRouter(prefix="/api/join-requests", tags=["Join Requests"])


def simple_ai_review(reason: str, contribution: str):
    reason_text = reason.lower()
    contribution_text = contribution.lower()

    score = 0
    spam_risk = "Low"

    if len(reason.strip()) >= 20:
        score += 30
    elif len(reason.strip()) >= 10:
        score += 15

    if len(contribution.strip()) >= 20:
        score += 30
    elif len(contribution.strip()) >= 10:
        score += 15

    good_words = [
        "learn",
        "contribute",
        "help",
        "project",
        "community",
        "startup",
        "developer",
        "ai",
        "design",
        "network",
        "collaborate",
        "student",
        "team",
        "meetup",
        "technology",
    ]

    for word in good_words:
        if word in reason_text or word in contribution_text:
            score += 3

    spam_words = [
        "money",
        "crypto",
        "betting",
        "casino",
        "free money",
        "spam",
        "promotion",
        "scam",
    ]

    for word in spam_words:
        if word in reason_text or word in contribution_text:
            score -= 20
            spam_risk = "High"

    if score < 0:
        score = 0

    if score > 100:
        score = 100

    if score >= 70 and spam_risk == "Low":
        decision = "Approve"
    elif score >= 45:
        decision = "Review"
    else:
        decision = "Reject"

    summary = (
        f"AI reviewed the join request. Score is {score}/100. "
        f"Decision suggestion: {decision}. Spam risk: {spam_risk}."
    )

    return {
        "score": score,
        "decision": decision,
        "summary": summary,
        "spam_risk": spam_risk,
    }


@router.post("/")
def create_join_request(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    community_id = data.get("community_id")
    reason = data.get("reason")
    contribution = data.get("contribution")

    if current_user.role == "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin cannot send join request. Use normal user account."
        )

    if not community_id:
        raise HTTPException(status_code=400, detail="Community ID is required")

    if not reason or not contribution:
        raise HTTPException(
            status_code=400,
            detail="Reason and contribution are required"
        )

    community = db.query(Community).filter(
        Community.id == int(community_id)
    ).first()

    if not community:
        raise HTTPException(status_code=404, detail="Community not found")

    existing_request = db.query(JoinRequest).filter(
        JoinRequest.user_id == current_user.id,
        JoinRequest.community_id == int(community_id)
    ).first()

    if existing_request:
        raise HTTPException(
            status_code=400,
            detail=f"You already sent a join request. Current status: {existing_request.status}"
        )

    ai_result = simple_ai_review(reason, contribution)

    status = "pending"

    if community.approval_type == "auto":
        status = "approved"

    new_request = JoinRequest(
        user_id=current_user.id,
        community_id=int(community_id),
        reason=reason,
        contribution=contribution,
        status=status,
        ai_score=ai_result["score"],
        ai_decision=ai_result["decision"],
        ai_summary=ai_result["summary"],
        ai_spam_risk=ai_result["spam_risk"],
    )

    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    return {
        "message": "Join request sent successfully"
        if status == "pending"
        else "You joined this community successfully",
        "join_request": {
            "id": new_request.id,
            "user_id": new_request.user_id,
            "community_id": new_request.community_id,
            "reason": new_request.reason,
            "contribution": new_request.contribution,
            "status": new_request.status,
            "ai_score": new_request.ai_score,
            "ai_decision": new_request.ai_decision,
            "ai_summary": new_request.ai_summary,
            "ai_spam_risk": new_request.ai_spam_risk,
            "created_at": new_request.created_at,
        },
    }


@router.get("/my-requests")
def get_my_join_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    requests = db.query(JoinRequest).filter(
        JoinRequest.user_id == current_user.id
    ).order_by(JoinRequest.id.desc()).all()

    result = []

    for item in requests:
        community = db.query(Community).filter(
            Community.id == item.community_id
        ).first()

        result.append({
            "id": item.id,
            "community_id": item.community_id,
            "community_name": community.name if community else "Unknown Community",
            "reason": item.reason,
            "contribution": item.contribution,
            "status": item.status,
            "ai_score": item.ai_score,
            "ai_decision": item.ai_decision,
            "ai_summary": item.ai_summary,
            "ai_spam_risk": item.ai_spam_risk,
            "created_at": item.created_at,
        })

    return result


@router.get("/")
def get_all_join_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required)
):
    requests = db.query(JoinRequest).order_by(JoinRequest.id.desc()).all()

    result = []

    for item in requests:
        user = db.query(User).filter(User.id == item.user_id).first()

        community = db.query(Community).filter(
            Community.id == item.community_id
        ).first()

        result.append({
            "id": item.id,
            "user_id": item.user_id,
            "community_id": item.community_id,
            "user_name": user.full_name if user else "Unknown User",
            "user_email": user.email if user else "Unknown Email",
            "community_name": community.name if community else "Unknown Community",
            "reason": item.reason,
            "contribution": item.contribution,
            "status": item.status,
            "ai_score": item.ai_score,
            "ai_decision": item.ai_decision,
            "ai_summary": item.ai_summary,
            "ai_spam_risk": item.ai_spam_risk,
            "created_at": item.created_at,
        })

    return result


@router.patch("/{request_id}/approve")
def approve_join_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required)
):
    join_request = db.query(JoinRequest).filter(
        JoinRequest.id == request_id
    ).first()

    if not join_request:
        raise HTTPException(status_code=404, detail="Join request not found")

    join_request.status = "approved"

    db.commit()
    db.refresh(join_request)

    return {
        "message": "Join request approved successfully",
        "join_request_id": join_request.id,
        "status": join_request.status,
    }


@router.patch("/{request_id}/reject")
def reject_join_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required)
):
    join_request = db.query(JoinRequest).filter(
        JoinRequest.id == request_id
    ).first()

    if not join_request:
        raise HTTPException(status_code=404, detail="Join request not found")

    join_request.status = "rejected"

    db.commit()
    db.refresh(join_request)

    return {
        "message": "Join request rejected successfully",
        "join_request_id": join_request.id,
        "status": join_request.status,
    }


@router.delete("/{request_id}")
def delete_join_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required)
):
    join_request = db.query(JoinRequest).filter(
        JoinRequest.id == request_id
    ).first()

    if not join_request:
        raise HTTPException(status_code=404, detail="Join request not found")

    db.delete(join_request)
    db.commit()

    return {
        "message": "Join request deleted successfully"
    }