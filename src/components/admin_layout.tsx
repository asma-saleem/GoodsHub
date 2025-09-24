'use client';

import React, { useState } from 'react';
import { Layout, Button } from 'antd';
import { ProductOutlined, UnorderedListOutlined, LogoutOutlined } from '@ant-design/icons';
import { useSession, signOut } from 'next-auth/react';
import ProductsContent from '@/app/(admin)/admin/products';
import OrdersContent from '@/app/(admin)/admin/orders';

const { Header, Sider, Content } = Layout;

const AdminLayout: React.FC = () => {
  const { data: session } = useSession();
  const [selectedKey, setSelectedKey] = useState<'products' | 'orders'>('products');

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sider width={257} style={{ background: '#fff', paddingTop: 20 }}>
        <p className='font-inter font-bold text-[16px] leading-6 pt-3 pb-6 pl-5'>
          E-commerce
        </p>

        <div className="flex flex-col items-center gap-4">
          <Button
            type={selectedKey === 'products' ? 'primary' : 'default'}
            icon={<ProductOutlined />}
            size="large"
            className="!w-[217px] !h-[48px] font-inter !text-[16px]"
            onClick={() => setSelectedKey('products')}
          >
            Products
          </Button>

          <Button
            type={selectedKey === 'orders' ? 'primary' : 'default'}
            icon={<UnorderedListOutlined />}
            size="large"
            className="!w-[217px] !h-[48px] font-inter !text-[16px]"
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
            className="!pl-0 font-inter !font-semibold text-[14px] !text-[#EF1014]"
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
          <span className="font-inter font-medium text-[12px] text-[#007BFF]">
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
