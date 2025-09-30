'use client';

import React, { useState } from 'react';
import { Layout, Button } from 'antd';
import { ProductOutlined, UnorderedListOutlined, LogoutOutlined } from '@ant-design/icons';
import { useSession, signOut } from 'next-auth/react';
import ProductsContent from '@/app/(admin)/admin/products';
import OrdersContent from '@/app/(admin)/admin/orders';

import './admin-layout.css';

const { Header, Sider, Content } = Layout;

const AdminLayout: React.FC = () => {
  const { data: session } = useSession();
  const [selectedKey, setSelectedKey] = useState<'products' | 'orders'>('products');

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sider width={257} style={{ background: '#fff', paddingTop: 20 }}>
        <p className='sidebar-title'>
          E-commerce
        </p>

        <div className="sidebar-buttons">
          <Button
            type={selectedKey === 'products' ? 'primary' : 'default'}
            icon={<ProductOutlined />}
            size="large"
            className="sidebar-button"
            onClick={() => setSelectedKey('products')}
          >
            Products
          </Button>

          <Button
            type={selectedKey === 'orders' ? 'primary' : 'default'}
            icon={<UnorderedListOutlined />}
            size="large"
            className="sidebar-button"
            onClick={() => setSelectedKey('orders')}
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

      {/* Main */}
      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '18px 36px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #eee',
            height:'48px'
          }}
        >
          <h3 style={{ margin: 0 }}></h3>
          <span className="header-username">
            {session?.user?.name || 'Guest'}
          </span>
        </Header>

        <Content style={{ margin: '16px', padding: 24, background: '#fff' }}>
          {selectedKey === 'products' ? <ProductsContent /> : <OrdersContent />}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
