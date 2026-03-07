from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from db.database import get_db
from models.models import User
from schemas.auth import UserCreate, UserLogin, Token, UserResponse
from utils.security import get_password_hash, verify_password, create_access_token
import structlog

logger = structlog.get_logger()
router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate, db: AsyncSession = Depends(get_db)):
    logger.info("register_attempt", email=user.email)
    
    query = select(User).where(User.email == user.email)
    result = await db.execute(query)
    existing_user = result.scalars().first()
    
    if existing_user:
        logger.warning("register_failed_email_exists", email=user.email)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
        
    hashed_password = get_password_hash(user.password)
    new_user = User(email=user.email, hashed_password=hashed_password)
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    logger.info("register_success", user_id=new_user.id)
    return new_user

@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    logger.info("login_attempt", email=user_credentials.email)
    
    query = select(User).where(User.email == user_credentials.email)
    result = await db.execute(query)
    user = result.scalars().first()
    
    if not user or not verify_password(user_credentials.password, user.hashed_password):
        logger.warning("login_failed", email=user_credentials.email)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token = create_access_token(data={"sub": user.email, "id": user.id})
    logger.info("login_success", user_id=user.id)
    
    return {"access_token": access_token, "token_type": "bearer"}
