import { prisma } from '@/lib/prisma';
import { findUserByEmail } from './userService';
import { CartItemType } from '../types/cart';

export async function getOrderById(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: { product: true }
      },
      user: true
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
}

export async function getOrdersByEmail(email: string) {
  const user = await findUserByEmail(email);

  if (!user) return null;

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: {
      items: { include: { product: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return orders;
}

export async function createOrder(cart: CartItemType[], email: string) {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error('User not found');
  }

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.qty),
    0
  );

  // Run everything in a transaction
  const order = await prisma.$transaction(async (tx) => {
    // 1. Create order
    const newOrder = await tx.order.create({
      data: {
        userId: user.id,
        total,
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