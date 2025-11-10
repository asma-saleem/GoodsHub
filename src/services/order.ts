import type { Prisma, OrderStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { TAX_RATE } from '@/lib/utils';

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
          variant: {  
            select: {
              id: true,
              image: true,
              price: true,
              size: true,
              color: true,
              colorCode: true,
              product: {
                select: {
                  id: true,
                  title: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!order) return null;
  return order;
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
      orderStatus: true,
      items: { select: { id: true } } 
    },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * pageSize,
    take: pageSize
  });

  const total = await prisma.order.count({
    where
  });

  return { orders, total };
}

export async function createOrder(cart: CartItemType[], userId: string ) {

  const subTotal = cart.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.qty),
    0
  );
  const tax = subTotal * TAX_RATE; 
  const total = subTotal + tax;

  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(
    now.getMonth() + 1
  ).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;

  const randomPart = Math.floor(100000 + Math.random() * 900000);
  const orderNo = `${dateStr}${randomPart}`;

  const variantIds = cart.map(item => item.variantId);

  const dbVariants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: { product: true }
  });
  const errors: string[] = [];
  
  for (const item of cart) {
    const dbVariant = dbVariants.find(v => v.id === item.variantId);
    
    if (!dbVariant) {
      throw new Error(`Variant not found for product "${item.title}".`);
    }
    
    if (dbVariant.isVariantDeleted) {
        throw new Error(`"${item.title}" (${item.color}/${item.size}) is no longer available.`);
    }
    
    if (dbVariant.stock < item.qty) {
      errors.push(
        `Not enough stock for product ${item.title} with (${item.color}/${item.size}). Only ${dbVariant.stock} left.`
      );
      continue;
    }
  }
  if (errors.length > 0) {
    throw { validation: true, errors };
  }
  
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        userId,
        total,
        orderNo,
        items: {
          create: cart.map((item) => ({
            productId: item.id,
            variantId: item.variantId,
            quantity: item.qty,
            price: Number(item.price)
          }))
        }
      },
      include: { items: true }
    });
    await Promise.all(
    cart.map((item) =>
      tx.productVariant.update({
        where: { id: item.variantId },
        data: {
          stock: { decrement: item.qty }
        }
      })
    )
  );


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
      orderStatus: true,
      user: {select:{fullname:true,email: true}},
      items: {
        select: {
          quantity: true,
           variant: {  
            select: {
              id: true,
              image: true,
              price: true,
              size: true,
              color: true,
              colorCode: true,
              product: {
                select: {
                  id: true,
                  title: true
                }
              }
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * pageSize,
    take: pageSize
  });

  const latestSummary = await prisma.orderSummary.findFirst({
    orderBy: { date: 'desc' },
    select: {
      totalOrders: true,
      totalUnits: true,
      totalAmount: true
    }
  });
  const total = await prisma.order.count({
    where
  });

  const totalOrders = latestSummary?.totalOrders ?? 0;
  const totalUnits = latestSummary?.totalUnits ?? 0;
  const totalAmount = latestSummary?.totalAmount ?? 0;
  return { orders, total,totalOrders, totalUnits, totalAmount };
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { orderStatus: status }
  });
  return order;
}

export async function updateOrderStripeSessionId(orderId: string, stripeSessionId: string) {
  return await prisma.order.update({
    where: { id: orderId },
    data: { stripeSessionId }
  });
}

export async function fetchOrderForStripeVerification(orderId: string) {
  return prisma.order.findUnique({ where: { id: orderId } });
}


