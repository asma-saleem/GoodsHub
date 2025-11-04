from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    Integer,
    Float,
    DateTime,
)
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Order(Base):
    __tablename__ = 'Order'
    __table_args__ = {'quote': True}
    id = Column(Integer, primary_key=True)
    total = Column(Float)
    createdAt = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updatedAt = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    items = relationship("OrderItem", back_populates="order")

