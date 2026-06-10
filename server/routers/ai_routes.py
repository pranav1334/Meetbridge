from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import os
import json
import requests

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

router = APIRouter(prefix="/api/ai", tags=["AI"])

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_MODEL = os.getenv(
    "OPENROUTER_MODEL",
    "meta-llama/llama-3.1-8b-instruct:free"
)


def call_openrouter(system_prompt: str, user_prompt: str):
    if not OPENROUTER_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="OpenRouter API key is missing in server .env"
        )

    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:5173",
                "X-Title": "MeetBridge",
            },
            json={
                "model": OPENROUTER_MODEL,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                "temperature": 0.5,
            },
            timeout=45,
        )

        if response.status_code != 200:
            raise HTTPException(
                status_code=500,
                detail=f"AI provider error: {response.text}"
            )

        data = response.json()

        return data["choices"][0]["message"]["content"]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")


def safe_json_loads(text: str):
    try:
        cleaned = text.strip()

        if cleaned.startswith("```json"):
            cleaned = cleaned.replace("```json", "").replace("```", "").strip()

        if cleaned.startswith("```"):
            cleaned = cleaned.replace("```", "").strip()

        return json.loads(cleaned)

    except Exception:
        return None


def is_approved_member(db: Session, user_id: int, community_id: int):
    approved = db.query(JoinRequest).filter(
        JoinRequest.user_id == user_id,
        JoinRequest.community_id == community_id,
        JoinRequest.status == "approved"
    ).first()

    return approved is not None


@router.post("/chat")
def ai_chat(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    message = data.get("message")

    if not message:
        raise HTTPException(status_code=400, detail="Message is required")

    system_prompt = """
You are MeetBridge AI assistant.
Help users with communities, meetups, networking, profiles, join requests, and opportunities.
Give helpful, short, practical answers.
Do not say only safe/unsafe labels.
"""

    user_prompt = f"""
User profile:
Name: {current_user.full_name}
Profession: {current_user.profession}
City: {current_user.city}
Looking for: {current_user.looking_for}
Can help with: {current_user.can_help_with}

User question:
{message}
"""

    answer = call_openrouter(system_prompt, user_prompt)

    return {
        "answer": answer
    }


@router.post("/improve-profile")
def improve_profile(
    data: dict,
    current_user: User = Depends(get_current_user)
):
    bio = data.get("bio", current_user.bio or "")
    looking_for = data.get("looking_for", current_user.looking_for or "")
    can_help_with = data.get("can_help_with", current_user.can_help_with or "")

    system_prompt = """
You are an AI profile builder for a tech community platform.
Improve the user's profile in simple professional language.
Return only valid JSON with:
{
  "improved_bio": "...",
  "improved_looking_for": "...",
  "improved_can_help_with": "...",
  "profile_strength_score": 0-100,
  "tips": ["tip1", "tip2", "tip3"]
}
"""

    user_prompt = f"""
Current bio: {bio}
Looking for: {looking_for}
Can help with: {can_help_with}
Profession: {current_user.profession}
City: {current_user.city}
"""

    ai_text = call_openrouter(system_prompt, user_prompt)
    parsed = safe_json_loads(ai_text)

    if parsed:
        return parsed

    return {
        "improved_bio": ai_text,
        "improved_looking_for": looking_for,
        "improved_can_help_with": can_help_with,
        "profile_strength_score": 70,
        "tips": ["Add your skills", "Mention what you need", "Mention what you can offer"]
    }


@router.get("/community-recommendations")
def community_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    communities = db.query(Community).all()

    if not communities:
        return {
            "recommendations": []
        }

    community_text = "\n".join([
        f"ID: {c.id}, Name: {c.name}, Category: {c.category}, City: {c.city}, Description: {c.description}"
        for c in communities
    ])

    system_prompt = """
You recommend the best communities for a user.
Return only valid JSON:
{
  "recommendations": [
    {
      "community_id": 1,
      "community_name": "...",
      "match_score": 90,
      "reason": "..."
    }
  ]
}
"""

    user_prompt = f"""
User:
Profession: {current_user.profession}
City: {current_user.city}
Bio: {current_user.bio}
Looking for: {current_user.looking_for}
Can help with: {current_user.can_help_with}

Communities:
{community_text}
"""

    ai_text = call_openrouter(system_prompt, user_prompt)
    parsed = safe_json_loads(ai_text)

    if parsed:
        return parsed

    return {
        "recommendations": [
            {
                "community_id": c.id,
                "community_name": c.name,
                "match_score": 70,
                "reason": "This community may match your interests."
            }
            for c in communities[:5]
        ]
    }


@router.get("/meetup-recommendations")
def meetup_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    meetups = db.query(Meetup).all()

    if not meetups:
        return {
            "recommendations": []
        }

    meetup_text = "\n".join([
        f"ID: {m.id}, Title: {m.title}, Date: {m.date}, Venue: {m.venue_name}, Description: {m.description}"
        for m in meetups
    ])

    system_prompt = """
Recommend meetups for the user.
Return only valid JSON:
{
  "recommendations": [
    {
      "meetup_id": 1,
      "meetup_title": "...",
      "match_score": 85,
      "reason": "..."
    }
  ]
}
"""

    user_prompt = f"""
User:
Profession: {current_user.profession}
City: {current_user.city}
Bio: {current_user.bio}
Looking for: {current_user.looking_for}
Can help with: {current_user.can_help_with}

Meetups:
{meetup_text}
"""

    ai_text = call_openrouter(system_prompt, user_prompt)
    parsed = safe_json_loads(ai_text)

    if parsed:
        return parsed

    return {
        "recommendations": [
            {
                "meetup_id": m.id,
                "meetup_title": m.title,
                "match_score": 70,
                "reason": "This meetup may be useful for your networking goals."
            }
            for m in meetups[:5]
        ]
    }


@router.get("/member-matches/{community_id}")
def member_matchmaking(
    community_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        allowed = is_approved_member(db, current_user.id, community_id)

        if not allowed:
            raise HTTPException(
                status_code=403,
                detail="Only approved members can access matchmaking"
            )

    approved_requests = db.query(JoinRequest).filter(
        JoinRequest.community_id == community_id,
        JoinRequest.status == "approved"
    ).all()

    user_ids = [item.user_id for item in approved_requests if item.user_id != current_user.id]

    members = db.query(User).filter(User.id.in_(user_ids)).all()

    if not members:
        return {
            "matches": []
        }

    member_text = "\n".join([
        f"ID: {m.id}, Name: {m.full_name}, Profession: {m.profession}, City: {m.city}, Looking for: {m.looking_for}, Can help with: {m.can_help_with}, Bio: {m.bio}"
        for m in members
    ])

    system_prompt = """
You are an AI member matchmaking assistant.
Match the current user with useful members from the same community.
Return only valid JSON:
{
  "matches": [
    {
      "user_id": 1,
      "name": "...",
      "match_score": 88,
      "reason": "...",
      "suggested_message": "..."
    }
  ]
}
"""

    user_prompt = f"""
Current user:
Name: {current_user.full_name}
Profession: {current_user.profession}
City: {current_user.city}
Looking for: {current_user.looking_for}
Can help with: {current_user.can_help_with}
Bio: {current_user.bio}

Community members:
{member_text}
"""

    ai_text = call_openrouter(system_prompt, user_prompt)
    parsed = safe_json_loads(ai_text)

    if parsed:
        return parsed

    return {
        "matches": [
            {
                "user_id": m.id,
                "name": m.full_name,
                "match_score": 75,
                "reason": "This member may match your networking goals.",
                "suggested_message": f"Hi {m.full_name}, I found your profile interesting. Would you like to connect?"
            }
            for m in members[:5]
        ]
    }


@router.get("/people-to-meet/{meetup_id}")
def people_to_meet(
    meetup_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    meetup = db.query(Meetup).filter(Meetup.id == meetup_id).first()

    if not meetup:
        raise HTTPException(status_code=404, detail="Meetup not found")

    registration = db.query(MeetupRegistration).filter(
        MeetupRegistration.meetup_id == meetup_id,
        MeetupRegistration.user_id == current_user.id
    ).first()

    if current_user.role != "admin" and not registration:
        raise HTTPException(
            status_code=403,
            detail="Only registered attendees can use People to Meet"
        )

    registrations = db.query(MeetupRegistration).filter(
        MeetupRegistration.meetup_id == meetup_id,
        MeetupRegistration.user_id != current_user.id
    ).all()

    user_ids = [item.user_id for item in registrations]
    attendees = db.query(User).filter(User.id.in_(user_ids)).all()

    if not attendees:
        return {
            "people": []
        }

    attendee_text = "\n".join([
        f"ID: {u.id}, Name: {u.full_name}, Profession: {u.profession}, Looking for: {u.looking_for}, Can help with: {u.can_help_with}, Bio: {u.bio}"
        for u in attendees
    ])

    system_prompt = """
You are an AI networking assistant for meetups.
Suggest people the user should meet at this meetup.
Return only valid JSON:
{
  "people": [
    {
      "user_id": 1,
      "name": "...",
      "match_score": 92,
      "why_meet": "...",
      "conversation_starter": "..."
    }
  ]
}
"""

    user_prompt = f"""
Current user:
Name: {current_user.full_name}
Profession: {current_user.profession}
Looking for: {current_user.looking_for}
Can help with: {current_user.can_help_with}
Bio: {current_user.bio}

Meetup:
Title: {meetup.title}
Description: {meetup.description}

Attendees:
{attendee_text}
"""

    ai_text = call_openrouter(system_prompt, user_prompt)
    parsed = safe_json_loads(ai_text)

    if parsed:
        return parsed

    return {
        "people": [
            {
                "user_id": u.id,
                "name": u.full_name,
                "match_score": 75,
                "why_meet": "This attendee may be useful for your networking goals.",
                "conversation_starter": f"Hi {u.full_name}, what brings you to this meetup?"
            }
            for u in attendees[:5]
        ]
    }


@router.post("/opportunity-classifier")
def opportunity_classifier(
    data: dict,
    current_user: User = Depends(get_current_user)
):
    text = data.get("text")

    if not text:
        raise HTTPException(status_code=400, detail="Opportunity text is required")

    system_prompt = """
You classify opportunities for a tech community.
Return only valid JSON:
{
  "category": "internship/job/freelance/startup/collaboration/event/other",
  "quality_score": 0-100,
  "spam_risk": "Low/Medium/High",
  "summary": "...",
  "suggested_tags": ["tag1", "tag2"]
}
"""

    user_prompt = f"""
Opportunity text:
{text}
"""

    ai_text = call_openrouter(system_prompt, user_prompt)
    parsed = safe_json_loads(ai_text)

    if parsed:
        return parsed

    return {
        "category": "other",
        "quality_score": 60,
        "spam_risk": "Low",
        "summary": ai_text,
        "suggested_tags": ["community", "opportunity"]
    }


@router.get("/meetup-summary/{meetup_id}")
def meetup_summary(
    meetup_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required)
):
    meetup = db.query(Meetup).filter(Meetup.id == meetup_id).first()

    if not meetup:
        raise HTTPException(status_code=404, detail="Meetup not found")

    registrations = db.query(MeetupRegistration).filter(
        MeetupRegistration.meetup_id == meetup_id
    ).all()

    attendance = db.query(Attendance).filter(
        Attendance.meetup_id == meetup_id
    ).all()

    messages = db.query(Message).filter(
        Message.community_id == meetup.community_id,
        Message.is_deleted == False
    ).order_by(Message.created_at.desc()).limit(20).all()

    registration_text = "\n".join([
        f"Reason: {r.reason}, Want to learn: {r.want_to_learn}, Contribution: {r.contribution}, Status: {r.status}"
        for r in registrations
    ])

    message_text = "\n".join([
        f"{m.message_type}: {m.content}"
        for m in messages
    ])

    system_prompt = """
You summarize a meetup for admin.
Return only valid JSON:
{
  "summary": "...",
  "total_registrations_insight": "...",
  "attendance_insight": "...",
  "top_interests": ["..."],
  "next_topic_ideas": ["..."],
  "improvement_suggestions": ["..."]
}
"""

    user_prompt = f"""
Meetup:
Title: {meetup.title}
Description: {meetup.description}
Date: {meetup.date}
Venue: {meetup.venue_name}

Total registrations: {len(registrations)}
Total check-ins: {len(attendance)}

Registration responses:
{registration_text}

Recent community messages:
{message_text}
"""

    ai_text = call_openrouter(system_prompt, user_prompt)
    parsed = safe_json_loads(ai_text)

    if parsed:
        return parsed

    return {
        "summary": ai_text,
        "total_registrations_insight": f"{len(registrations)} people registered.",
        "attendance_insight": f"{len(attendance)} people checked in.",
        "top_interests": [],
        "next_topic_ideas": [],
        "improvement_suggestions": []
    }


@router.post("/safety-moderation")
def safety_moderation(
    data: dict,
    current_user: User = Depends(get_current_user)
):
    text = data.get("text")

    if not text:
        raise HTTPException(status_code=400, detail="Text is required")

    unsafe_words = [
        "hate",
        "kill",
        "scam",
        "fraud",
        "abuse",
        "threat",
        "harass",
        "casino",
        "betting",
        "free money",
    ]

    lower_text = text.lower()
    rule_flag = any(word in lower_text for word in unsafe_words)

    system_prompt = """
You are a safety moderation AI.
Check if the text is safe for a professional community platform.
Return only valid JSON:
{
  "safe": true,
  "risk_level": "Low/Medium/High",
  "reason": "...",
  "suggested_clean_text": "..."
}
"""

    user_prompt = f"""
Text:
{text}
"""

    ai_text = call_openrouter(system_prompt, user_prompt)
    parsed = safe_json_loads(ai_text)

    if parsed:
        if rule_flag:
            parsed["safe"] = False
            parsed["risk_level"] = "High"
        return parsed

    return {
        "safe": not rule_flag,
        "risk_level": "High" if rule_flag else "Low",
        "reason": "Basic safety check completed.",
        "suggested_clean_text": text
    }


@router.post("/review-join-request/{request_id}")
def review_join_request_with_ai(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required)
):
    join_request = db.query(JoinRequest).filter(
        JoinRequest.id == request_id
    ).first()

    if not join_request:
        raise HTTPException(status_code=404, detail="Join request not found")

    user = db.query(User).filter(User.id == join_request.user_id).first()
    community = db.query(Community).filter(
        Community.id == join_request.community_id
    ).first()

    system_prompt = """
You review community join requests.
Return only valid JSON:
{
  "score": 0-100,
  "decision": "Approve/Review/Reject",
  "spam_risk": "Low/Medium/High",
  "summary": "..."
}
"""

    user_prompt = f"""
User:
Name: {user.full_name if user else "Unknown"}
Profession: {user.profession if user else ""}
Bio: {user.bio if user else ""}
Looking for: {user.looking_for if user else ""}
Can help with: {user.can_help_with if user else ""}

Community:
Name: {community.name if community else ""}
Category: {community.category if community else ""}
Description: {community.description if community else ""}

Join request:
Reason: {join_request.reason}
Contribution: {join_request.contribution}
"""

    ai_text = call_openrouter(system_prompt, user_prompt)
    parsed = safe_json_loads(ai_text)

    if not parsed:
        parsed = {
            "score": 70,
            "decision": "Review",
            "spam_risk": "Low",
            "summary": ai_text
        }

    join_request.ai_score = parsed.get("score")
    join_request.ai_decision = parsed.get("decision")
    join_request.ai_spam_risk = parsed.get("spam_risk")
    join_request.ai_summary = parsed.get("summary")

    db.commit()
    db.refresh(join_request)

    return parsed