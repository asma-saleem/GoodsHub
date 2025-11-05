'use client';

import React, { useEffect, useState } from 'react';
import { Table, Input, Spin, Button, Card, Drawer, Space } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import Image from 'next/image';
import moment from 'moment';
import { formatPrice } from '@/lib/utils';
import { toast } from 'react-toastify';

import { OrderType } from '@/types/order';
import { useAppDispatch, useAppSelector } from '@/redux/store/hooks';
import {
  fetchOrders,
  setPage,
  setQuery,
  clearOrder
} from '@/redux/store/slices/order-slice';
import './orders.css';
import { OrderDetailPage } from '@/app/(user)/orders-detail/OrderDetailPage';

const OrdersContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    data,
    total,
    totalOrders,
    totalUnits,
    totalAmount,
    loadingList,
    currentPage,
    query
  } = useAppSelector((state) => state.orders);

  const [searchTerm, setSearchTerm] = useState(query || '');
  const [debouncedTerm, setDebouncedTerm] = useState(query || '');
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

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

  const handleMarkCompleted = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH'
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Order marked as completed');
        dispatch(
          fetchOrders({ page: currentPage, pageSize: 10, query: debouncedTerm })
        );
      } else {
        toast.error(data.error || 'Failed to mark order as completed');
      }
    } catch (err) {
      console.error('Error updating order:', err);
      toast.error('Something went wrong');
    }
  };

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
    { title: 'User Name', dataIndex: 'userName', key: 'userName' },
    { title: 'Product(s)', dataIndex: 'products', key: 'products' },
    {
      title: 'Order Status',
      dataIndex: 'orderStatus'
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => <span>{formatPrice(amount)}</span>
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: OrderType) => (
        console.log('Order status:', record.orderStatus),
        (
          <Space>
            <Button
              type='text'
              icon={<ArrowRightOutlined />}
              onClick={() => {
                setSelectedOrderId(record.id);
                setOpenDrawer(true);
              }}
            />
            {(record.orderStatus === 'PAID' ||
              record.orderStatus === 'COMPLETED') && (
              <Button
                type='primary'
                disabled={record.orderStatus === 'COMPLETED'}
                onClick={() => {
                  if (record.orderStatus === 'PAID') {
                    handleMarkCompleted(record.id);
                  }
                }}
                style={{
                  opacity: record.orderStatus === 'COMPLETED' ? 0.6 : 1,
                  cursor:
                    record.orderStatus === 'COMPLETED'
                      ? 'not-allowed'
                      : 'pointer'
                }}
              >
                {record.orderStatus === 'COMPLETED'
                  ? 'Completed'
                  : 'Mark as Complete'}
              </Button>
            )}
          </Space>
        )
      )
    }
  ];

  if (loadingList) {
    return (
      <div className='orders-loading-container'>
        <Spin size='large' />
      </div>
    );
  }

  return (
    <div className='orders-wrapper'>
      <div className='orders-stats-grid'>
        <Card className='orders-card'>
          <div className='orders-card-inner'>
            <div className='orders-card-text'>
              <p className='orders-card-title'>Total Orders:</p>
              <h2 className='orders-card-value'>{totalOrders}</h2>
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
        <Card className='orders-card'>
          <div className='orders-card-inner'>
            <div className='orders-card-text'>
              <p className='orders-card-title'>Total Units:</p>
              <h2 className='orders-card-value'>{totalUnits}</h2>
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
        <Card className='orders-card'>
          <div className='orders-card-inner'>
            <div className='orders-card-text'>
              <p className='orders-card-title'>Total Amount:</p>
              <h2 className='orders-card-value'>{formatPrice(totalAmount)}</h2>
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
        <h4 className='orders-header-title'>Orders</h4>
        <div className='orders-search'>
          <div className='orders-search-inner'>
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
        rowKey='id'
        pagination={{
          current: currentPage,
          pageSize: 12,
          total,
          showSizeChanger: false,
          onChange: (page) => dispatch(setPage(page))
        }}
        bordered
        className='orders-table'
      />
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

export default OrdersContent;
