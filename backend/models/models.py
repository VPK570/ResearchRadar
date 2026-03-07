from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, Text, JSON
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    searches = relationship("Search", back_populates="owner")
    saved_hypotheses = relationship("SavedHypothesis", back_populates="owner")

class Search(Base):
    __tablename__ = "searches"
    
    id = Column(Integer, primary_key=True, index=True)
    query = Column(String, index=True, nullable=False)
    status = Column(String, default="pending") # pending, fetching, building, gaps, hypotheses, completed, failed
    paper_count = Column(Integer, default=0)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # allow anonymous searches optionally
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Optional parameters
    config_num_papers = Column(Integer, default=50)
    config_num_gaps = Column(Integer, default=5)
    config_sim_threshold = Column(Float, default=0.55)
    # Result storage
    results = Column(JSON, nullable=True)
    
    owner = relationship("User", back_populates="searches")

class SavedHypothesis(Base):
    __tablename__ = "saved_hypotheses"
    
    id = Column(Integer, primary_key=True, index=True)
    search_id = Column(Integer, ForeignKey("searches.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    title = Column(String, nullable=False)
    hypothesis_text = Column(Text, nullable=False)
    methodology = Column(Text, nullable=False)
    impact = Column(Text, nullable=False)
    novelty_score = Column(Float, nullable=False)
    
    paper_a_title = Column(String, nullable=False)
    paper_b_title = Column(String, nullable=False)
    
    saved_at = Column(DateTime, default=datetime.utcnow)
    
    owner = relationship("User", back_populates="saved_hypotheses")
