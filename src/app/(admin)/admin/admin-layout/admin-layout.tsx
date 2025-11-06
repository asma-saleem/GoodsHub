'use client';

import React from 'react';
import { Layout, Button } from 'antd';
import { ProductOutlined, UnorderedListOutlined, LogoutOutlined } from '@ant-design/icons';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import './admin-layout.css';

const { Header, Sider, Content } = Layout;

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const selectedKey = pathname.includes('/orders') ? 'orders' : 'products';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={257}
        style={{
          background: '#fff',
          paddingTop: 20,
          height: '100vh',
          position: 'sticky',
          top: 0,
          overflow: 'hidden',
          borderRight: '1px solid #eee'
        }}
      >
        <p className='sidebar-title'>
          E-commerce
        </p>

        <div className="sidebar-buttons">
          <Button
            type={selectedKey === 'products' ? 'primary' : 'default'}
            icon={<ProductOutlined />}
            size="large"
            className="sidebar-button"
            onClick={() => router.push('/admin/products')}
          >
            Products
          </Button>

          <Button
            type={selectedKey === 'orders' ? 'primary' : 'default'}
            icon={<UnorderedListOutlined />}
            size="large"
            className="sidebar-button"
            onClick={() => router.push('/admin/orders')}
          >
            Orders
          </Button>
        </div>

        <div style={{ position: 'absolute', bottom: 20, width: '100%', textAlign: 'center' }}>
          <Button
            type="link"
            onClick={() => signOut()}
            danger
            icon={<LogoutOutlined style={{ color: '#EF1014' }} />}
            className="logout-button"
          >
            Logout
          </Button>
        </div>
      </Sider>

      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '18px 36px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #eee',
            height: '48px',
            boxShadow: '0px 4px 24px 0px #00000012',
            zIndex: 1000
          }}
        >
          <h3 style={{ margin: 0 }}></h3>
          <span className="header-username">
            {session?.user?.name || 'Guest'}
          </span>
        </Header>

        <Content style={{ padding: 24, background: '#fff' }}>{children}</Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
