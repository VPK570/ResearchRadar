import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

# Get the directory of this file (backend/db)
DB_DIR = os.path.dirname(os.path.abspath(__file__))
# Put database in the backend folder
DB_PATH = os.path.join(os.path.dirname(DB_DIR), "researchradar.db")
SQLALCHEMY_DATABASE_URL = f"sqlite+aiosqlite:///{DB_PATH}"

# SQLAlchemy engine for SQLite requires check_same_thread=False
engine = create_async_engine(
    SQLALCHEMY_DATABASE_URL,
    echo=False,
    future=True,
    connect_args={"check_same_thread": False}
)

# Async session factory
AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
