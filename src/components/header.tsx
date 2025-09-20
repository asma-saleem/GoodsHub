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
// import { ProductType } from '@/types/product';
import { CartItem } from '@/types/cart';

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
    updateCartCount(); // jab header render ho tab bhi count load karo

    // ✅ jab bhi ProductCard se event aaye
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
    <header className='flex justify-between bg-white mobile:px-4 tablet:px-6 xl:px-9 desktop:px-9 py-3'>
      <p className='font-inter font-bold text-base text-[#343A40] !mb-0'>
        E-commerce
      </p>
      <div className='flex items-center gap-5'>
        <Badge count={cartCount}  offset={[0, -3]} className="[&_.ant-badge-count]:!min-w-[20px] [&_.ant-badge-count]:!h-[20px] [&_.ant-badge-count]:!leading-[20px] [&_.ant-badge-count]:!rounded-full [&_.ant-badge-count]:!text-[10px] [&_.ant-badge-count]:!p-0">
        <ShoppingOutlined
          onClick={() => {
             (window.location.href = session ? '/shopping-bag' : '/auth/login');
          }}
          className='cursor-pointer'
          style={{ fontSize: 16,color: '#007BFF' }}
        />
        </Badge>
        <BellOutlined className='w-4 h-4' style={{ color: '#007BFF' }} />

        {session ? (
          <Dropdown
            menu={{ items: menu, style: { padding: '0.5rem 2rem' } }} // ✅ padding applied here
            trigger={['click']}
          >
            <span className='flex items-center gap-2 cursor-pointer'>
              <UserOutlined
                className='w-4 h-4 cursor-pointer'
                style={{ color: '#007BFF'}}
              />
              <span className='text-sm text-[#007BFF]'>
                {session.user?.name}
              </span>
            </span>
          </Dropdown>
        ) : (
          <Link
            href='/auth/login'
            className='font-inter font-medium text-xs text-[#007BFF]'
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
