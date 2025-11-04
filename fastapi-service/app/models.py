import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    Integer,
    Float,
    ForeignKey,
    String,
    Boolean,
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

class OrderItem(Base):
    __tablename__ = 'OrderItem'
    __table_args__ = {'quote': True}
    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("Order.id"))
    quantity = Column(Integer)
    createdAt = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updatedAt = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    order = relationship("Order", back_populates="items")

class Product(Base):
    __tablename__ = "Product"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    title = Column(String, index=True)
    isProductDeleted = Column(Boolean, default=False)
    createdAt = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updatedAt = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    variants = relationship("ProductVariant", back_populates="product")