from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from database import get_db
from models import User, Message, JoinRequest, Notification
from auth import get_current_user

router = APIRouter(prefix="/api/messages", tags=["Messages"])


def is_approved_member(db: Session, user_id: int, community_id: int):
    approved = db.query(JoinRequest).filter(
        JoinRequest.user_id == user_id,
        JoinRequest.community_id == community_id,
        JoinRequest.status == "approved"
    ).first()

    return approved is not None


def create_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    notification_type: str = "info",
    target_url: str = None
):
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        notification_type=notification_type,
        target_url=target_url
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    return notification


@router.post("/direct")
def send_direct_message(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    receiver_id = data.get("receiver_id")
    content = data.get("content")

    if not receiver_id or not content:
        raise HTTPException(
            status_code=400,
            detail="Receiver and message content are required"
        )

    receiver = db.query(User).filter(User.id == receiver_id).first()

    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")

    if receiver.id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot message yourself")

    message = Message(
        sender_id=current_user.id,
        receiver_id=receiver_id,
        content=content,
        message_type="direct"
    )

    db.add(message)
    db.commit()
    db.refresh(message)

    create_notification(
        db=db,
        user_id=receiver_id,
        title="New Direct Message",
        message=f"{current_user.full_name} sent you a message.",
        notification_type="message",
        target_url=f"/messages?user={current_user.id}"
    )

    return {
        "message": "Message sent successfully",
        "data": {
            "id": message.id,
            "content": message.content,
            "sender_id": message.sender_id,
            "receiver_id": message.receiver_id,
            "is_read": message.is_read,
            "created_at": message.created_at
        }
    }


@router.get("/direct/{user_id}")
def get_direct_messages(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    other_user = db.query(User).filter(User.id == user_id).first()

    if not other_user:
        raise HTTPException(status_code=404, detail="User not found")

    messages = db.query(Message).filter(
        Message.message_type == "direct",
        Message.is_deleted == False,
        or_(
            and_(
                Message.sender_id == current_user.id,
                Message.receiver_id == user_id
            ),
            and_(
                Message.sender_id == user_id,
                Message.receiver_id == current_user.id
            )
        )
    ).order_by(Message.created_at.asc()).all()

    for message in messages:
        if message.receiver_id == current_user.id:
            message.is_read = True

    db.commit()

    result = []

    for message in messages:
        sender = db.query(User).filter(User.id == message.sender_id).first()

        result.append({
            "id": message.id,
            "sender_id": message.sender_id,
            "receiver_id": message.receiver_id,
            "sender_name": sender.full_name if sender else "Unknown",
            "content": message.content,
            "is_read": message.is_read,
            "is_pinned": message.is_pinned,
            "is_reported": message.is_reported,
            "created_at": message.created_at,
            "mine": message.sender_id == current_user.id
        })

    return result


@router.post("/community")
def send_community_message(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    community_id = data.get("community_id")
    content = data.get("content")
    message_type = data.get("message_type", "general")

    allowed_types = ["general", "opportunity", "announcement"]

    if message_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid message type")

    if not community_id or not content:
        raise HTTPException(status_code=400, detail="Community and content are required")

    if current_user.role != "admin":
        allowed = is_approved_member(db, current_user.id, community_id)

        if not allowed:
            raise HTTPException(
                status_code=403,
                detail="Only approved community members can send messages"
            )

    if message_type == "announcement" and current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only admin can post announcements"
        )

    message = Message(
        sender_id=current_user.id,
        community_id=community_id,
        content=content,
        message_type=message_type
    )

    db.add(message)
    db.commit()
    db.refresh(message)

    if message_type == "announcement":
        approved_members = db.query(JoinRequest).filter(
            JoinRequest.community_id == community_id,
            JoinRequest.status == "approved"
        ).all()

        for member in approved_members:
            create_notification(
                db=db,
                user_id=member.user_id,
                title="New Community Announcement",
                message=f"New announcement posted in community ID {community_id}.",
                notification_type="announcement",
                target_url=f"/community-chat/{community_id}?tab=announcement"
            )

    return {
        "message": "Community message sent successfully",
        "data": {
            "id": message.id,
            "community_id": message.community_id,
            "content": message.content,
            "message_type": message.message_type,
            "created_at": message.created_at
        }
    }


@router.get("/community/{community_id}")
def get_community_messages(
    community_id: int,
    message_type: str = "general",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    allowed_types = ["general", "opportunity", "announcement"]

    if message_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid message type")

    if current_user.role != "admin":
        allowed = is_approved_member(db, current_user.id, community_id)

        if not allowed:
            raise HTTPException(
                status_code=403,
                detail="Only approved community members can view this chat"
            )

    messages = db.query(Message).filter(
        Message.community_id == community_id,
        Message.message_type == message_type,
        Message.is_deleted == False
    ).order_by(Message.is_pinned.desc(), Message.created_at.asc()).all()

    result = []

    for message in messages:
        sender = db.query(User).filter(User.id == message.sender_id).first()

        result.append({
            "id": message.id,
            "sender_id": message.sender_id,
            "sender_name": sender.full_name if sender else "Unknown",
            "content": message.content,
            "message_type": message.message_type,
            "is_pinned": message.is_pinned,
            "is_reported": message.is_reported,
            "created_at": message.created_at,
            "mine": message.sender_id == current_user.id
        })

    return result


@router.patch("/{message_id}/pin")
def pin_message(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    message = db.query(Message).filter(Message.id == message_id).first()

    if not message:
        raise HTTPException(status_code=404, detail="Message not found")

    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admin can pin messages")

    message.is_pinned = not message.is_pinned

    db.commit()
    db.refresh(message)

    return {
        "message": "Message pin status updated",
        "is_pinned": message.is_pinned
    }


@router.patch("/{message_id}/report")
def report_message(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    message = db.query(Message).filter(Message.id == message_id).first()

    if not message:
        raise HTTPException(status_code=404, detail="Message not found")

    message.is_reported = True

    db.commit()
    db.refresh(message)

    return {
        "message": "Message reported successfully"
    }


@router.delete("/{message_id}")
def delete_message(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    message = db.query(Message).filter(Message.id == message_id).first()

    if not message:
        raise HTTPException(status_code=404, detail="Message not found")

    if current_user.role != "admin" and message.sender_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You can only delete your own messages"
        )

    message.is_deleted = True

    db.commit()

    return {
        "message": "Message deleted successfully"
    }


@router.get("/reported/all")
def get_reported_messages(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admin can view reported messages")

    messages = db.query(Message).filter(
        Message.is_reported == True,
        Message.is_deleted == False
    ).order_by(Message.created_at.desc()).all()

    result = []

    for message in messages:
        sender = db.query(User).filter(User.id == message.sender_id).first()

        result.append({
            "id": message.id,
            "sender_name": sender.full_name if sender else "Unknown",
            "content": message.content,
            "message_type": message.message_type,
            "community_id": message.community_id,
            "created_at": message.created_at
        })

    return result