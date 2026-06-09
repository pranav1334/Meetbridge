from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import os
import requests
import json
import re
from dotenv import load_dotenv

from database import get_db
from models import User, Community, Meetup, JoinRequest
from schemas import AIProfileImproveRequest, AIChatRequest
from auth import get_current_user

load_dotenv()

router = APIRouter(prefix="/api/ai", tags=["AI Features"])

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_MODEL = os.getenv(
    "OPENROUTER_MODEL",
    "meta-llama/llama-3.1-8b-instruct:free"
)


def call_openrouter(system_prompt: str, user_prompt: str):
    if not OPENROUTER_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="OPENROUTER_API_KEY not found in .env file"
        )

    url = "https://openrouter.ai/api/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "MeetBridge"
    }

    payload = {
        "model": OPENROUTER_MODEL,
        "messages": [
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": user_prompt
            }
        ],
        "temperature": 0.4
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=40)
        response.raise_for_status()

        data = response.json()

        return data["choices"][0]["message"]["content"]

    except requests.exceptions.RequestException as error:
        raise HTTPException(
            status_code=500,
            detail=f"OpenRouter API error: {str(error)}"
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"AI response error: {str(error)}"
        )


def clean_ai_json(ai_text: str):
    text = ai_text.strip()

    text = text.replace("```json", "")
    text = text.replace("```JSON", "")
    text = text.replace("```", "")
    text = text.strip()

    try:
        return json.loads(text)
    except Exception:
        pass

    json_match = re.search(r"(\{.*\}|\[.*\])", text, re.DOTALL)

    if json_match:
        try:
            return json.loads(json_match.group(1))
        except Exception:
            pass

    return {
        "message": text
    }


@router.post("/improve-profile")
def improve_profile(
    data: AIProfileImproveRequest,
    current_user: User = Depends(get_current_user)
):
    system_prompt = """
You are an AI profile writing assistant for MeetBridge, a community meetup platform.

Your task:
Improve the user's bio, looking for, and can help with text.

Rules:
- Return only valid JSON.
- Do not use markdown.
- Do not wrap JSON in ```json.
- Keep language simple, professional, and clear.

Return format:
{
  "improved_bio": "text",
  "improved_looking_for": "text",
  "improved_can_help_with": "text"
}
"""

    user_prompt = f"""
User details:
Name: {current_user.full_name}
Profession: {current_user.profession}
Company/College: {current_user.company_college}
City: {current_user.city}

Current Bio:
{data.bio}

Looking For:
{data.looking_for}

Can Help With:
{data.can_help_with}
"""

    ai_text = call_openrouter(system_prompt, user_prompt)
    return clean_ai_json(ai_text)


@router.get("/community-recommendations")
def community_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    communities = db.query(Community).all()

    community_data = [
        {
            "id": c.id,
            "name": c.name,
            "category": c.category,
            "city": c.city,
            "description": c.description
        }
        for c in communities
    ]

    system_prompt = """
You are an AI recommendation engine for MeetBridge.

Your task:
Recommend the best communities for the user.

Rules:
- Return only valid JSON.
- Do not use markdown.
- Do not wrap JSON in ```json.
- Score must be out of 100.
- Give simple reasons.

Return format:
[
  {
    "community_id": 1,
    "community_name": "Community Name",
    "score": 90,
    "reason": "Simple reason"
  }
]
"""

    user_prompt = f"""
User profile:
Name: {current_user.full_name}
Profession: {current_user.profession}
City: {current_user.city}
Bio: {current_user.bio}
Looking For: {current_user.looking_for}
Can Help With: {current_user.can_help_with}

Available communities:
{json.dumps(community_data)}
"""

    ai_text = call_openrouter(system_prompt, user_prompt)
    return clean_ai_json(ai_text)


@router.post("/review-join-request/{request_id}")
def review_join_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
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

    if not user or not community:
        raise HTTPException(status_code=404, detail="User or community not found")

    system_prompt = """
You are an AI admin assistant for MeetBridge.

Your task:
Review a community join request and give an admin-friendly suggestion.
The admin makes the final decision.

Scoring:
Profile Completeness: 20
Community Relevance: 25
Join Reason Quality: 20
Contribution Quality: 20
Spam/Safety Check: 15

Rules:
- Return only valid JSON.
- Do not use markdown.
- Do not wrap JSON in ```json.
- Score must be out of 100.

Return format:
{
  "score": 85,
  "decision": "Approve",
  "spam_risk": "Low",
  "reason_summary": "Simple reason summary"
}

Decision must be one of:
Approve, Review, Ask more information, Reject suggestion.
"""

    user_prompt = f"""
User:
Name: {user.full_name}
Profession: {user.profession}
Company/College: {user.company_college}
City: {user.city}
Bio: {user.bio}
LinkedIn: {user.linkedin_url}
Looking For: {user.looking_for}
Can Help With: {user.can_help_with}

Community:
Name: {community.name}
Category: {community.category}
City: {community.city}
Description: {community.description}
Rules: {community.rules}

Join Reason:
{join_request.reason}

Contribution:
{join_request.contribution}
"""

    ai_text = call_openrouter(system_prompt, user_prompt)
    ai_result = clean_ai_json(ai_text)

    if isinstance(ai_result, dict):
        join_request.ai_score = ai_result.get("score")
        join_request.ai_decision = ai_result.get("decision")
        join_request.ai_spam_risk = ai_result.get("spam_risk")
        join_request.ai_reason_summary = ai_result.get("reason_summary")

        db.commit()
        db.refresh(join_request)

        return {
            "message": "AI review completed",
            "ai_result": ai_result
        }

    return {
        "message": "AI review completed",
        "ai_result": ai_result
    }


@router.get("/meetup-recommendations")
def meetup_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    meetups = db.query(Meetup).all()

    meetup_data = [
        {
            "id": m.id,
            "title": m.title,
            "description": m.description,
            "date": m.date,
            "venue_name": m.venue_name
        }
        for m in meetups
    ]

    system_prompt = """
You are an AI meetup recommendation engine for MeetBridge.

Your task:
Recommend useful meetups for the user.

Rules:
- Return only valid JSON.
- Do not use markdown.
- Do not wrap JSON in ```json.
- Score must be out of 100.
- Give simple reasons.

Return format:
[
  {
    "meetup_id": 1,
    "meetup_title": "Meetup Title",
    "score": 90,
    "reason": "Simple reason"
  }
]
"""

    user_prompt = f"""
User profile:
Name: {current_user.full_name}
Profession: {current_user.profession}
City: {current_user.city}
Bio: {current_user.bio}
Looking For: {current_user.looking_for}
Can Help With: {current_user.can_help_with}

Available meetups:
{json.dumps(meetup_data)}
"""

    ai_text = call_openrouter(system_prompt, user_prompt)
    return clean_ai_json(ai_text)


@router.post("/chat")
def ai_chat(
    data: AIChatRequest,
    current_user: User = Depends(get_current_user)
):
    system_prompt = """
You are MeetBridge AI Assistant.

MeetBridge is a community engagement and meetup platform.

Your job is to help users with:
- choosing communities
- finding meetups
- improving profile
- writing join request answers
- networking advice
- community engagement suggestions
- understanding how to attend meetups
- finding useful people to connect with

Important rules:
- Always answer the user's question directly.
- Do not reply with safety labels like "User Safety: safe".
- Do not act as a moderation classifier.
- Do not return JSON.
- Do not say only "safe" or "unsafe".
- Use simple normal text.
- Keep the response useful and related to MeetBridge.
- If the user asks something outside the app, answer briefly and guide them back to communities, meetups, or networking.
"""

    user_prompt = f"""
User profile:
Name: {current_user.full_name}
Profession: {current_user.profession}
City: {current_user.city}
Bio: {current_user.bio}
Looking For: {current_user.looking_for}
Can Help With: {current_user.can_help_with}

User question:
{data.message}
"""

    reply = call_openrouter(system_prompt, user_prompt)

    blocked_phrases = [
        "User Safety: safe",
        "User Safety: unsafe",
        "Safety: safe",
        "safe"
    ]

    if reply.strip() in blocked_phrases:
        reply = (
            "I can help you with community recommendations, meetup suggestions, "
            "profile improvement, join request writing, and networking guidance. "
            "Please ask your question related to MeetBridge."
        )

    return {
        "reply": reply
    }


@router.post("/safety-moderation")
def safety_moderation(data: AIChatRequest):
    system_prompt = """
You are an AI safety moderator for MeetBridge.

Your task:
Check if the text contains spam, fake links, abuse, scam, repeated promotion, or unsafe content.

Rules:
- Return only valid JSON.
- Do not use markdown.
- Do not wrap JSON in ```json.

Return format:
{
  "risk": "Low",
  "reason": "Simple reason"
}

Risk must be one of:
Low, Medium, High
"""

    user_prompt = f"""
Text to check:
{data.message}
"""

    ai_text = call_openrouter(system_prompt, user_prompt)
    return clean_ai_json(ai_text)