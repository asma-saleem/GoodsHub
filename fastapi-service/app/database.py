from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://d0eeb8c98f78eb415e626b034ae331e92684bbb3c6a9598a44b95b8e0ff69dd4:sk_YLm7IF105XeI_pUoSg5Gp@db.prisma.io:5432/postgres?sslmode=require")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()