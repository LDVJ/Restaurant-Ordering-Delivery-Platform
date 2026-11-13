from fastapi import APIRouter, Depends, status, Query
from app.oauth2 import customer_only, CurrentCustomer
from app.schemas import AiInsightAnswer, AiInsightQuestion
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db
from app.services.gemini_services import get_ai_response_service


router = APIRouter(
    tags=["AI-Insight"],
    dependencies=[Depends(customer_only)],
    prefix="/ai/insights"
)


@router.post("",response_model=AiInsightAnswer, status_code=status.HTTP_200_OK)
async def get_ai_reponse(
    customer : CurrentCustomer,
    payload : AiInsightQuestion,
    db : AsyncSession = Depends(get_db)
):
    return await get_ai_response_service(
        customer = customer,
        user_question = payload.question,
        db = db
    )