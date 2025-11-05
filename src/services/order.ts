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
    where: { userId }
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
    for (const item of cart) {
      const product = await tx.product.findUnique({
        where: { id: item.id },
        include: { variants: true }
      });

      if (!product) {
        throw new Error(`Product with id ${item.id} not found`);
      }
      const variant = product.variants.find(v => v.id === item.variantId);
      if (!variant) {
          throw new Error(`Variant with id ${item.variantId} not found for product ${product.title}`);
      }
      if (variant.isVariantDeleted) {
          throw new Error(`Variant "${variant.size}" (${variant.color}) is no longer available.`);
      }
      if (variant.stock < item.qty) {
        throw new Error(
          `Not enough stock for product ${product.title}. Only ${variant.stock} left.`
        );
      }
      await tx.productVariant.update({
      where: { id: variant.id },
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
      orderStatus: true,
      user: {select:{fullname:true}},
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

  const total = latestSummary?.totalOrders ?? 0;
  const totalUnits = latestSummary?.totalUnits ?? 0;
  const totalAmount = latestSummary?.totalAmount ?? 0;
  return { orders, total, totalUnits, totalAmount };
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

