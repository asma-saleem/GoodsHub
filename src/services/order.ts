import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

import { CartItemType } from '../types/cart';

export async function getOrderById(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      id: true,  
      total: true, 
      orderNo: true,
      createdAt: true,
      userId: true,
      items: {
        select: {
          quantity: true,
          product: {
            select: {
              id:true,
              image: true,
              title: true,
              price: true
            }
          }
        }
      }
    }
  });

  if (!order) return null;

  // Map items: quantity → qty
  return {
    ...order,
    items: order.items.map((item) => ({
      ...item,
      qty: item.quantity
    }))
  };
};

export async function getOrdersByUserId(
  userId: string,
  page: number = 1,
  pageSize: number = 10,
  query: string = ''
) {
  const baseCondition: Prisma.OrderWhereInput = {
    userId
  };

  const queryCondition: Prisma.OrderWhereInput = query
     ? {
        orderNo: { contains: query, mode: 'insensitive' }
      }
    : {};

  const where: Prisma.OrderWhereInput = {
    AND: [baseCondition, queryCondition]
  };

  const orders = await prisma.order.findMany({
    where,
    select: { 
      id: true,
      createdAt: true,
      orderNo:true,
      total: true,
      items: { select: { id: true } } 
    },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * pageSize,
    take: pageSize
  });
  const total = await prisma.order.count({
    where: { userId }
  });

  return { orders, total };
}

export async function createOrder(cart: CartItemType[], userId: string) {

  const subTotal = cart.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.qty),
    0
  );
  const tax = subTotal * 0.1; 
  const total = subTotal + tax;

  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(
    now.getMonth() + 1
  ).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;

  // Random 6 digit number
  const randomPart = Math.floor(100000 + Math.random() * 900000);
  const orderNo = `${dateStr}${randomPart}`;

  const order = await prisma.$transaction(async (tx) => {
    // 1. Create order
    const newOrder = await tx.order.create({
      data: {
        userId,
        total,
        orderNo,
        items: {
          create: cart.map((item) => ({
            productId: item.id,
            quantity: item.qty,
            price: Number(item.price)
          }))
        }
      },
      include: { items: true }
    });

    // 2. Update stock for each product
    for (const item of cart) {
      const product = await tx.product.findUnique({
        where: { id: item.id }
      });

      if (!product) {
        throw new Error(`Product with id ${item.id} not found`);
      }

      if (product.stock < item.qty) {
        throw new Error(
          `Not enough stock for product ${product.title}. Only ${product.stock} left.`
        );
      }
      await tx.product.update({
        where: { id: item.id },
        data: {
          stock: {
            decrement: item.qty
          }
        }
      });
    }

    return newOrder;
  });

  return order;
}

export async function getAllOrders(
  page: number = 1,
  pageSize: number = 10,
  query: string = ''
) {
  const where: Prisma.OrderWhereInput = query
    ? {
        OR: [
          { id: { contains: query, mode: 'insensitive' } },
          {orderNo: { contains: query, mode: 'insensitive' }},
          {
          user: {
            fullname: { contains: query, mode: 'insensitive' }
          }
        }

        ]
      }
    : {};
  const orders = await prisma.order.findMany({
    where,
    select: {
      id: true,  
      total: true, 
      orderNo: true,
      createdAt: true,
      user: {select:{fullname:true}},
      items: {
        select: {
          quantity: true,
          product: {
            select: {
              id:true,
              image: true,
              title: true,
              price: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * pageSize,
    take: pageSize
  });

  const total = await prisma.order.count();

  const allOrders = await prisma.order.findMany({
    // where,
    include: { items: true }
  });

  const totalUnits = allOrders.reduce(
    (sum, order) =>
      sum +
      (order.items?.reduce((s, item) => s + (item.quantity || 0), 0) || 0),
    0
  );

  const totalAmount = allOrders.reduce(
    (sum, order) => sum + (order.total || 0),
    0
  );

  // Map items: quantity → qty
  const mappedOrders = orders.map((order) => ({
    ...order,
    items: order.items.map((item) => ({
      ...item,
      qty: item.quantity
    }))
  }));

  return { orders: mappedOrders, total, totalUnits, totalAmount };
}
