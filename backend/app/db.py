from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.config import settings
from sqlalchemy.orm import DeclarativeBase

DB_URL = settings.DB_URL

engine = create_async_engine(
    DB_URL,
    pool_size= 10,
    max_overflow=20,
    pool_pre_ping=True)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    autoflush=False,
    class_=AsyncSession,
    expire_on_commit=False
)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with AsyncSessionLocal() as db:
        yield db

