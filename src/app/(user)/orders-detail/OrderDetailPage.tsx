'use client';

import React, { useEffect } from 'react';
import { Spin, Table } from 'antd';
import type { TableColumnsType } from 'antd';
import Image from 'next/image';
import moment from 'moment';

import { OrderItemType } from '@/types/order';
import { useAppDispatch, useAppSelector } from '@/redux/store/hooks';
import { fetchOrderDetail } from '@/redux/store/slices/order-slice';
import { formatPrice } from '@/lib/utils';

import './order-detail.css';

interface OrderDetailPageProps {
  orderId: string;
}

export const OrderDetailPage: React.FC<OrderDetailPageProps> = ({
  orderId
}) => {
  const dispatch = useAppDispatch();
  const { order, loadingDetail } = useAppSelector((state) => state.orders);

  useEffect(() => {
    if (!orderId) return;
    if (order && order.id === orderId) return;

    dispatch(fetchOrderDetail(orderId));
  }, [dispatch, orderId, order]);

  if (loadingDetail) {
    return (
      <div className="orderDetail-loading-container">
        <Spin size="large" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="orderDetail-loading-container">
        <p className="error-text">Order not found!</p>
      </div>
    );
  }

  const dataSource: OrderItemType[] =
    order.items?.map((item, index: number) => ({
      key: index,
      product: item.variant.product,
      variantId: item.variantId,
      variant: item.variant,
      image: item.variant?.image || '',
      quantity: item.quantity,
      price: item.variant?.price || item.price
    })) || [];

  const columns: TableColumnsType<OrderItemType> = [
    {
      title: <span className="main-text-color">Title</span>,
      dataIndex: 'product',
      render: (_, record: OrderItemType) => (
        <div className="product-cell">
          <Image
            src={record.variant?.image || '/placeholder.png'}
            alt={record.variant.product?.title}
            width={24}
            height={24}
            className="product-image-order-detail"
          />
          <span className="product-name">{record.variant.product?.title}</span>
        </div>
      )
    },
    {
      title: <span className="main-text-color">Color</span>,
      dataIndex: 'color',
      onCell: () => ({
        style: {
          minWidth: '200px'
        }
      }),
      render: (_, record) => (
        <div className="color-container">
          <span
            className="color-circle"
            style={{ backgroundColor: record.variant.colorCode }}
          />
          <span className="color-text">{record.variant.color}</span>
        </div>
      )
    },
    {
      title: <span className="main-text-color">Size</span>,
      dataIndex: 'size',
      render: (_, record) => (
        <span className="main-text-color">{record.variant?.size}</span>
      )
    },
    {
      title: <span className="main-text-color">Unit Price</span>,
      render: (_, record) => (
        <span className="main-text-color">
          {formatPrice(record.variant?.price)}
        </span>
      )
    },
    {
      title: <span className="main-text-color">Qty</span>,
      dataIndex: 'quantity',
      render: (quantity: number) => (
        <span className="main-text-color">{quantity}</span>
      )
    },
    {
      title: <span className="main-text-color">Total Price</span>,
      render: (_, record) => (
        <span className="main-text-color">
          {formatPrice(record.variant?.price * record.quantity)}
        </span>
      )
    }
  ];

  return (
    <div className="order-detail-container">
      <div className="order-summary-grid">
        <div>
          <p className="summary-label">Date</p>
          <div>{moment(order.createdAt).format('MM/DD/YYYY')}</div>
          <div style={{ fontSize: '0.85em', color: '#555' }}>
            {moment(order.createdAt).format('hh:mm:ss A')}
          </div>
        </div>
        <div>
          <p className="summary-label">Order #</p>
          <p className="summary-value">{order.orderNo}</p>
        </div>
        <div>
          <p className="summary-label">Products</p>
          <p className="summary-value">{order.items.length}</p>
        </div>
        <div>
          <p className="summary-label">Tax</p>
          <p className="summary-value">10%</p>
        </div>
        <div>
          <p className="summary-label">Amount</p>
          <p className="summary-value">{formatPrice(order.total)}</p>
        </div>
      </div>

      <div className="divider-section"></div>

      <h4 className="product-info-title">Product Information</h4>

      <div className="table-container">
        <Table<OrderItemType>
          columns={columns}
          dataSource={dataSource}
          pagination={{ pageSize: 10 }}
          bordered
          rowClassName={() => '!h-12'}
        />
      </div>
    </div>
  );
};
