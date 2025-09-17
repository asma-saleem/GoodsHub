import { prisma } from '@/lib/prisma';
import { findUserByEmail } from './userService';
import { CartItemType } from '../types/cart';

export async function getOrderById(id: number) {
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
  const tax = total * 0.1;
  const order = await prisma.order.create({
    data: {
      userId: user.id,
      total,
      tax,
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

  return order;
}
