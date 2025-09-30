'use client';

import Link from 'next/link';
import { MenuProps, Badge } from 'antd';
import {
  ShoppingOutlined,
  BellOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Dropdown } from 'antd';
import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';

import { CartItem } from '@/types/cart';
import './header.css';

export default function Header() {
  const { data: session } = useSession();
  const [cartCount, setCartCount] = useState(0);

  // unique products count
 const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    // unique products count
    // const uniqueCount = new Set(cart.map((item: ProductType) => item.id)).size;
    // setCartCount(uniqueCount);
    
    // Quantity count
    const totalQty = cart.reduce((sum: number, item: CartItem) => sum + item.qty, 0);
    setCartCount(totalQty);
};

  useEffect(() => {
    updateCartCount();
    window.addEventListener('cartUpdated', updateCartCount);

    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  const menu: MenuProps['items'] = [
    {
      key: 'orders',
      label: <Link href='/orders'>Orders</Link>
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      label: (
        <span
          onClick={() => {
            localStorage.removeItem('cart');
            signOut({ callbackUrl: '/' });
          }}
        >
          Logout
        </span>
      )
    }
  ];
  return (
    <header className='main-header-container'>
      <p className='header-title'>
        E-commerce
      </p>
      <div className='icons-container'>
        <Badge count={cartCount}  offset={[0, -3]} className="cart-badge">
        <ShoppingOutlined
          onClick={() => {
             (window.location.href = session ? '/shopping-bag' : '/auth/login');
          }}
          className='cursor-pointer'
          style={{ fontSize: 16,color: '#007BFF' }}
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
                style={{ color: '#007BFF'}}
              />
              <span className='header-username'>
                {session.user?.name}
              </span>
            </span>
          </Dropdown>
        ) : (
          <Link
            href='/auth/login'
            className='login-link'
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
