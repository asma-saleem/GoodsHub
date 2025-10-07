'use client';

import React, { useEffect, useState } from 'react';
import { Table, Input, Spin, Button, Card } from 'antd';
import { useRouter } from 'next/navigation';
import { ArrowRightOutlined } from '@ant-design/icons';
import Image from 'next/image';
import moment from 'moment';

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

  const columns = [
    {
          title: 'Date',
          dataIndex: 'date',
          render: (val: string | Date) => {
         const dateObj = moment(val);
        return (
        <div>
          <div>{dateObj.format('MM/DD/YYYY')}</div> 
          <div style={{ fontSize: '0.85em', color: '#555' }}>
            {dateObj.format('hh:mm:ss A')} 
          </div>
        </div>
      );
    }
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
        bordered
        className="orders-table"
      />
    </div>
  );
};

export default OrdersContent;
