'use client';

import React, { useEffect, useState } from 'react';
import { Table, Input, Spin, Button, Card } from 'antd';
import { useRouter } from 'next/navigation';
import { ArrowRightOutlined } from '@ant-design/icons';
import Image from 'next/image';

import { OrderType } from '@/types/order';

import { useAppDispatch, useAppSelector } from '@/redux/store/hooks';

import {
  fetchOrders,
  setPage,
  setQuery
} from '@/redux/store/slices/order-slice';
import './orders.css';

const OrdersContent: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
    const { data, total,totalOrders, totalUnits, totalAmount, loading, currentPage, query } = useAppSelector(
      (state) => state.orders
    );
    const [searchTerm, setSearchTerm] = useState(query || '');
    const [debouncedTerm, setDebouncedTerm] = useState(query || '');
  
    useEffect(() => {
      const timer = setTimeout(() => {
        setDebouncedTerm(searchTerm);
        dispatch(setQuery(searchTerm));
      }, 500);
      return () => clearTimeout(timer);
    }, [searchTerm, dispatch]);
  
    useEffect(() => {
      dispatch(
        fetchOrders({ page: currentPage, pageSize: 10, query: debouncedTerm })
      );
    }, [dispatch, currentPage, debouncedTerm]);
//   const [orders, setOrders] = useState<OrderType[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [total, setTotal] = useState(0);
//   const [currentPage, setCurrentPage] = useState(1);
  

//   const [totalOrders, setTotalOrders] = useState(0);
//   const [totalUnits, setTotalUnits] = useState(0);
//   const [totalAmount, setTotalAmount] = useState(0);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [debouncedTerm, setDebouncedTerm] = useState('');
//   useEffect(() => {
//   const timer = setTimeout(() => {
//     setDebouncedTerm(searchTerm);
//     setCurrentPage(1); 
//   }, 500);
//   return () => clearTimeout(timer);
// }, [searchTerm]);
//   const fetchOrders = async (page = 1, pageSize = 12, query = '') => {
//     try {
//       setLoading(true);
//       const res = await fetch(`/api/orders?page=${page}&pageSize=${pageSize}&q=${query}`);
//       const json = await res.json();

//       if (!res.ok) throw new Error(json.error || 'Failed to fetch orders');
//       // console.log(JSON.stringify(json));

//       const mappedOrders: OrderType[] = (json.orders || []).map((order: OrderType, index: number) => ({
//         id: order.id,
//         key: index,
//         date: new Date(order.createdAt).toLocaleDateString(),
//         orderNo: order.id,
//         user: order.userId || 0,
//         userId: order.userId || 0,
//         products: order.items?.reduce((sum, item) => sum + (item.qty ?? 0), 0) || 0,
//         amount: order.total || 0,
//         createdAt: order.createdAt,
//         total: order.total || 0,
//         items: (order.items || []).map((item, i: number): OrderItemType => ({
//           key: i,
//           product: item.product,
//           image: item.image || '',
//           qty: item.qty,
//           price: item.price
//         }))
//       }));

//       setOrders(mappedOrders);
//       setTotal(json.total || 0);
//        // 👉 calculate summary
//       setTotalOrders(json.total || mappedOrders.length);
//       setTotalUnits(json.totalUnits||mappedOrders.reduce((sum, o) => sum + o.products, 0));
//       setTotalAmount(json.totalAmount||mappedOrders.reduce((sum, o) => sum + (o.amount ?? 0), 0));
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchOrders(currentPage,12,debouncedTerm);
//   }, [currentPage,debouncedTerm]);

  const columns = [
    { title: 'Date', 
      dataIndex: 'date', 
      key: 'date' 
    },
    {
      title: 'Order #',
      dataIndex: 'orderNo',
      key: 'orderNo',
      render: (val: string | number) => <span>{val}</span>
    },
    { title: 'User Name', 
      dataIndex: 'userName', 
      key: 'userName' 
    }, 
    { title: 'Product(s)', 
      dataIndex: 'products', 
      key: 'products' 
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => <span>${amount.toFixed(2)}</span>
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
    <div className="orders-wrapper">
      <div className="orders-stats-grid">
        <Card className="orders-card">
          <div className='orders-card-inner'>
            <div className='orders-card-text'>
              <p className="orders-card-title">Total Orders:</p>
              <h2 className="orders-card-value">{totalOrders}</h2>
            </div>          
          <div className='orders-card-icon'>
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
        <Card className="orders-card">
          <div className='orders-card-inner'>
            <div className='orders-card-text'>
              <p className="orders-card-title">Total Units:</p>
              <h2 className="orders-card-value">{totalUnits}</h2>
            </div>          
          <div className='orders-card-icon'>
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
        <Card className="orders-card">
          <div className='orders-card-inner'>
            <div className='orders-card-text'>
              <p className="orders-card-title">Total Amount:</p>
              <h2 className="orders-card-value">${totalAmount.toLocaleString()}</h2>
            </div>         
          <div className='orders-card-icon'>
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
      <div className='orders-header'>
          <h4 className='orders-header-title'>
            Orders
          </h4>
          <div className='orders-search'>
            <div
              className='orders-search-inner'
            >
              <Input.Search
                placeholder='Search by username & order ID'
                className='orders-search-input'
                value={searchTerm}       
                onChange={(e) => setSearchTerm(e.target.value)}  
                onSearch={(value) => setDebouncedTerm(value)}    
                allowClear
              />
            </div>
          </div>
        </div>
      <Table<OrderType>
        dataSource={data}
        columns={columns}
        rowKey="id"
        pagination={{
          current: currentPage,
          pageSize: 12,
          total,
          onChange: (page) => dispatch(setPage(page))
        }}
        className="orders-table"
      />
    </div>
  );
};

export default OrdersContent;
