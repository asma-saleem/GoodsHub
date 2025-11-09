'use client';

import Link from 'next/link';
import { MenuProps, Badge } from 'antd';
import {
  ShoppingOutlined,
  BellOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Dropdown } from 'antd';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

import { CartItem } from '@/types/cart';
import './header.css';

export default function Header() {
  const { data: session, status } = useSession();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
      if (!session?.user?.id) return;
      const storageKey = `cart_${session.user.id}`;
      const cart = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const totalQty = cart.reduce(
        (sum: number, item: CartItem) => sum + item.qty,
        0
      );
      setCartCount(totalQty);
    };
    updateCartCount();
    window.addEventListener('cartUpdated', updateCartCount);

    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, [session?.user?.id]);

  const menu: MenuProps['items'] = [
    {
      key: 'orders',
      label: (
      <span
        onClick={() => {
          window.location.href = '/orders';
        }}
        style={{ cursor: 'pointer' }}
      >
        Orders
      </span>
    )
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      label: (
        <span
          onClick={() => {
            signOut({ callbackUrl: '/auth/login' });
          }}
        >
          Logout
        </span>
      )
    }
  ];
  return (
    <header className='main-header-container'>
      <p className='header-title'>E-commerce</p>
      <div className='icons-container'>
        <Badge count={cartCount} offset={[0, -3]} className='cart-badge'>
          <ShoppingOutlined
            onClick={() => {
              if (status === 'authenticated') {
                window.location.href = '/shopping-bag';
              } else {
                window.location.href = '/auth/login';
              }
            }}
            className='cursor-pointer'
            style={{ fontSize: 16, color: '#007BFF' }}
          />
        </Badge>
        <BellOutlined className='belloutlined' style={{ color: '#007BFF' }} />
        {session ? (
          <Dropdown
            menu={{ items: menu, style: { padding: '0.5rem 2rem' } }}
            trigger={['click']}
          >
            <span className='dropdown-container'>
              <UserOutlined
                className='dropdown-useroutlined'
                style={{ color: '#007BFF' }}
              />
              <span className='header-username'>{session.user?.name}</span>
            </span>
          </Dropdown>
        ) : (
          <Link href='/auth/login' className='login-link'>
            Login
          </Link>
        )}
      </div>
    </header>
  );
}