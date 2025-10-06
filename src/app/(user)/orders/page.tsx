'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Table, Button, Input } from 'antd';
import type { TableColumnsType } from 'antd';
import { Spin } from 'antd';
import { ArrowLeftOutlined, ExportOutlined } from '@ant-design/icons';

import { OrderType } from '@/types/order';
import { useAppDispatch, useAppSelector } from '@/redux/store/hooks';
import { formatPrice } from '@/lib/utils';

import {
  fetchOrders,
  setPage,
  setQuery
} from '@/redux/store/slices/order-slice';

import './page.css';

const Orders: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data, total, loading, currentPage, query } = useAppSelector(
    (state) => state.orders
  );
  const [searchTerm, setSearchTerm] = useState(query || '');
  const [debouncedTerm, setDebouncedTerm] = useState(query || '');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
      dispatch(setQuery(searchTerm));
    }, 700);
    return () => clearTimeout(timer);
  }, [searchTerm, dispatch]);

  useEffect(() => {
    dispatch(
      fetchOrders({ page: currentPage, pageSize: 10, query: debouncedTerm })
    );
  }, [dispatch, currentPage, debouncedTerm]);

  //  Table columns
  const columns: TableColumnsType<OrderType> = [
    {
      title: 'Date',
      dataIndex: 'date'
    },
    {
      title: 'Order #',
      dataIndex: 'orderNo',
      render: (val: string) => <span>{val}</span>
    },
    {
      title: 'Product(s)',
      dataIndex: 'products'
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      render: (amount: number) => <span>{formatPrice(amount)}</span>
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      render: (_, record) => (
        <Button
          type='text'
          icon={<ExportOutlined />}
          className='order-number'
          onClick={() => router.push(`/orders-detail/${record.id}`)}
        />
      )
    }
  ];
  if (loading) {
    return (
      <div className='loading-container'>
        <Spin size='large' />
      </div>
    );
  }

  return (
    <div>
      <div className='orders-container'>
        <div className='orders-header-with-search'>
          <div className='orders-header'>
            <Link href='/'>
              <ArrowLeftOutlined
                style={{ color: '#007BFF' }}
                onClick={() => router.back()}
              />
            </Link>
            <h4 className='orders-title'>Orders</h4>
          </div>
            <div
              className='ant-search-icon'
            >
              <Input.Search
                placeholder='Search by order ID'
                className='ant-input-search'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onSearch={(value) => setDebouncedTerm(value)}
                allowClear
              />
            </div>
      
        </div>
        <div className='table-container'>
          <Table<OrderType>
            columns={columns}
            dataSource={data}
            pagination={{
              current: currentPage,
              pageSize: 10,
              total: total,
              onChange: (page) => dispatch(setPage(page)),
              showSizeChanger: false,
              showTotal: (total) => (
                <span className='pagination-total'>{total} Total Count</span>
              )
            }}
            bordered
            scroll={{ x: 'max-content' }}
            rowClassName={() => 'h-12'}
            locale={{ emptyText: 'No orders found' }}
          />
        </div>
      </div>
    </div>
  );
};

export default Orders;
