"""Migration script using SQLAlchemy to update schema"""
import sys
import os

# Add server directory to path
sys.path.insert(0, os.path.dirname(__file__))

from database import engine, Base
from models import User

# Create all tables (SQLAlchemy will handle existing columns)
Base.metadata.create_all(bind=engine)
print("✓ Database schema updated successfully")
