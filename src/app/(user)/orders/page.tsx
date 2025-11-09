'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import moment from 'moment';

import { Table, Button, Input, Drawer, Spin } from 'antd';
import type { TableColumnsType } from 'antd';
import { ArrowLeftOutlined, ExportOutlined } from '@ant-design/icons';

import { OrderType } from '@/types/order';
import Header from '@/components/header/header';
import { useAppDispatch, useAppSelector } from '@/redux/store/hooks';
import { formatPrice } from '@/lib/utils';

import {
  fetchOrders,
  setPage,
  setQuery,
  clearOrder
} from '@/redux/store/slices/order-slice';
import { OrderDetailPage } from '../orders-detail/OrderDetailPage';

import './page.css';

const Orders: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { data, total, loadingList, currentPage, query } = useAppSelector(
    (state) => state.orders
  );

  const [searchTerm, setSearchTerm] = useState(query || '');
  const [debouncedTerm, setDebouncedTerm] = useState(query || '');
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

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

  const columns: TableColumnsType<OrderType> = [
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
      title: 'Order Status',
      dataIndex: 'orderStatus'
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      render: (_, record) => (
        <Button
          type='text'
          icon={<ExportOutlined />}
          className='order-number'
          onClick={() => {
            setSelectedOrderId(record.id);
            setOpenDrawer(true);
          }}
        />
      )
    }
  ];
  // if (loadingList) {
  //   return (
  //     <div className='loading-container'>
  //       <Spin size='large' />
  //     </div>
  //   );
  // }

  return (
    <div>
      <Header />
      <div className='orders-container'>
        <div className='orders-header-with-search'>
          <div className='orders-header'>
            <Link href='/'>
              <ArrowLeftOutlined
                style={{ color: '#007BFF' }}
                onClick={() => router.push('/')}
              />
            </Link>
            <h4 className='orders-title'>Orders</h4>
          </div>
          <div className='ant-search-icon'>
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
        {loadingList ? (
                <div className='orders-user-loading-container'>
                  <Spin size='large' />
                </div>
               ) :
              
              (

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
        )}
      </div>
          
      <Drawer
        title={<h2 className='orders-title'>Order Details</h2>}
        className='order-detail-drawer'
        open={openDrawer}
        onClose={() => {
          setOpenDrawer(false);
        }}
        afterOpenChange={(open) => {
          if (!open) dispatch(clearOrder());
        }}
        width={1050}
        destroyOnClose
      >
        {selectedOrderId && <OrderDetailPage orderId={selectedOrderId} />}
      </Drawer>
    </div>
  );
};

export default Orders;
