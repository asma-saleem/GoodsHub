'use client';
import Link from 'next/link';
import { MenuProps } from 'antd';
import {
  ShoppingOutlined,
  BellOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Dropdown} from 'antd';
import { useSession, signOut } from 'next-auth/react';

export default function Header() {
  const { data: session } = useSession();
  const menu: MenuProps['items'] = [
  {
    key: 'orders',
    label: <Link href="/orders">Orders</Link>
  },
  {
    type: 'divider' // ✅ must be literal 'divider'
  },
  {
    key: 'logout',
    label: (
      <span onClick={() => signOut({ callbackUrl: '/' })}>
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
        <ShoppingOutlined
          onClick={() =>
            (window.location.href = session ? '/shopping-bag' : '/auth/login')
          }
          className='w-4 h-4 cursor-pointer'
          style={{ color: '#007BFF' }}
        />
        <BellOutlined className='w-4 h-4' style={{ color: '#007BFF' }} />

        {session ? (
          <Dropdown 
          menu={{ items: menu, style: { padding: '0.5rem 2rem' } }} // ✅ padding applied here
            trigger={['click']}
            >
            <UserOutlined
              className='w-5 h-5 cursor-pointer'
              style={{ color: '#007BFF', fontSize: '18px' }}
            />
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
