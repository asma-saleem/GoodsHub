'use client';

import React, { useEffect, useState } from 'react';
import { Table, Input, Spin, Button, Card } from 'antd';
import { useRouter } from 'next/navigation';
import { OrderType, OrderItemType } from '@/types/order';
import { ArrowRightOutlined } from '@ant-design/icons';
// import { ProductType } from '@/types/product';
import Image from 'next/image';

const OrdersContent: React.FC = () => {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  const [totalOrders, setTotalOrders] = useState(0);
  const [totalUnits, setTotalUnits] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedTerm(searchTerm);
    setCurrentPage(1); // reset page when searching
  }, 500);
  return () => clearTimeout(timer);
}, [searchTerm]);
  const fetchOrders = async (page = 1, pageSize = 12, query = '') => {
    try {
      setLoading(true);
      const res = await fetch(`/api/orders?page=${page}&pageSize=${pageSize}&q=${query}`);
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || 'Failed to fetch orders');
      console.log(JSON.stringify(json));

      const mappedOrders: OrderType[] = (json.orders || []).map((order: OrderType, index: number) => ({
        id: order.id,
        key: index,
        date: new Date(order.createdAt).toLocaleDateString(),
        orderNo: order.id || `ORD-${index + 1}`,
        user: order.userId || 0,
        userId: order.userId || 0,
        products: order.items?.reduce((sum, item) => sum + (item.qty ?? 0), 0) || 0,
        amount: order.total || 0,
        createdAt: order.createdAt,
        total: order.total || 0,
        items: (order.items || []).map((item, i: number): OrderItemType => ({
          key: i,
          product: item.product,
          image: item.image || '',
          qty: item.qty,
          price: item.price
        }))
      }));

      setOrders(mappedOrders);
      setTotal(json.total || 0);
       // 👉 calculate summary
      setTotalOrders(json.total || mappedOrders.length);
      setTotalUnits(mappedOrders.reduce((sum, o) => sum + o.products, 0));
      setTotalAmount(mappedOrders.reduce((sum, o) => sum + (o.amount ?? 0), 0));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage,12,debouncedTerm);
  }, [currentPage,debouncedTerm]);

  const columns = [
    { title: 'Date', dataIndex: 'date', key: 'date' },
    {
      title: 'Order #',
      dataIndex: 'orderNo',
      key: 'orderNo',
      render: (val: string | number) => <span>{val}</span>
    },
    { title: 'User ID', dataIndex: 'userId', key: 'userId' }, 
    { title: 'Product(s)', dataIndex: 'products', key: 'products' },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amt: number) => `$${(amt ?? 0).toFixed(2)}`
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record:OrderType) => (
        <Button
          type="text"
          icon={<ArrowRightOutlined />}
          onClick={() => router.push(`/orders-detail/${record.id}`)}
        />
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="pl-4 sm:px-7 md:px-10 lg:px-14 xl:!px-15 bg-[#F9FAFB] min-h-screen pt-6">
       {/* 🔹 Summary Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="!p-4 !rounded-xl !shadow-md">
          <div className='flex justify-between'>
            <div className='space-y-[6px]'>
              <p className="font-inter font-medium text-sm leading-none tracking-normal text-[#0A0A0A]">Total Orders:</p>
              <h2 className="font-inter font-bold text-xl leading-none tracking-normal text-[#007BFF]">{totalOrders}</h2>
            </div>
          
          
          <div className='flex items-center gap-5'>
            {/* <ShoppingCartOutlined className="text-[#007BFF] text-2xl" /> */}
            <Image
              alt='example'
              src='/total-orders.png'
              width={48}
              height={48}
              className='object-contain'
              />
          </div>
          </div>
          
        </Card>
        <Card className="!p-4 !rounded-xl !shadow-md">
          <div className='flex justify-between'>
            <div className='space-y-[6px]'>
              <p className="font-inter font-medium text-sm leading-none tracking-normal text-[#0A0A0A]">Total Units:</p>
              <h2 className="font-inter font-bold text-xl leading-none tracking-normal text-[#007BFF]">{totalUnits}</h2>
            </div>
          
          
          <div className='flex items-center gap-5'>
            {/* <ShoppingCartOutlined className="text-[#007BFF] text-2xl" /> */}
            <Image
              alt='example'
              src='/total-units.png'
              width={48}
              height={48}
              className='object-contain'
              />
          </div>
          </div>
          
        </Card>
        <Card className="!p-4 !rounded-xl !shadow-md">
          <div className='flex justify-between'>
            <div className='space-y-[6px]'>
              <p className="font-inter font-medium text-sm leading-none tracking-normal text-[#0A0A0A]">Total Amount:</p>
              <h2 className="font-inter font-bold text-xl leading-none tracking-normal text-[#007BFF]">${totalAmount.toLocaleString()}</h2>
            </div>
          
          
          <div className='flex items-center gap-5'>
            {/* <ShoppingCartOutlined className="text-[#007BFF] text-2xl" /> */}
            <Image
              alt='example'
              src='/total-amount.png'
              width={48}
              height={48}
              className='object-contain'
              />
          </div>
          </div>
          
        </Card>
      </div>
      <div className='flex small:flex-col small:pt-5 small:pb-3 small:gap-y-2 mobile:flex-col mobile:pt-6 mobile:pb-4 mobile:gap-y-3 tablet:flex-row tablet:justify-between tablet:items-center tablet:pt-8 tablet:pb-6'>
          <h4 className='font-inter font-medium text-2xl leading-[28.8px] text-[#007BFF] !mb-0'>
            Orders
          </h4>
          <div className='flex items-center gap-6'>
            <div
              className='[&_.ant-btn]:!bg-[#E2E8F0]
                [&_.ant-btn-icon]:!text-gray-600'
            >
              <Input.Search
                placeholder='Search by user & order ID'
                className='mobile:!w-[234px] tablet:!w-[350px] [&_.ant-input-affix-wrapper]:!h-[36px] [&_.ant-input-search-button]:!h-[36px] rounded-lg'
                value={searchTerm}       
                onChange={(e) => setSearchTerm(e.target.value)}  
                onSearch={(value) => setDebouncedTerm(value)}    
                allowClear
              />
            </div>
          </div>
        </div>

      <Table<OrderType>
        dataSource={orders}
        columns={columns}
        rowKey="id"
        pagination={{
          current: currentPage,
          pageSize: 12,
          total,
          onChange: (page) => setCurrentPage(page)
        }}
        className="[&_.ant-table-cell]:!py-2 [&_.ant-table-thead_.ant-table-cell]:!text-[#535E63]"
      />
    </div>
  );
};

export default OrdersContent;
