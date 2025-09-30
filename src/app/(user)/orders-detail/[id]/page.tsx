'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Spin, Table } from 'antd';
import type { TableColumnsType } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Image from 'next/image';

import { OrderItemType } from '@/types/order';
import { useAppDispatch, useAppSelector } from '@/redux/store/hooks';
import { fetchOrderDetail, clearOrder } from '@/redux/store/slices/order-detail-slice';

import './page.css';

// Table Columns
const columns: TableColumnsType<OrderItemType> = [
  {
    title: <span className='main-text-color'>Title</span>,
    dataIndex: 'product',
    render: (_, record: OrderItemType) => (
      <div className='product-cell'>
        <Image
          src={record.product.image}
          alt={record.product.title}
          width={24}
          height={24}
          className='product-image'
        />
        <span className='product-name'>
          {record.product.title}
        </span>
      </div>
    )
  },
  {
    title: <span className='main-text-color'>Price</span>,
    render: (_, record) => (
    <span className="main-text-color">
      ${record.product.price.toFixed(2)}
    </span>)
  },
  {
    title: <span className='main-text-color'>Quantity</span>,
    dataIndex: 'qty',
    render: (qty: number) => (
    <span className='main-text-color'>
      {qty}
    </span>
  )
  }
];

 export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { order, loading } = useAppSelector((state) => state.orderDetail);

  useEffect(() => {
    if (params?.id) dispatch(fetchOrderDetail(params.id));
    return () => {
      dispatch(clearOrder());
    };
  }, [dispatch, params?.id]);
  
  // Loading & Error States
  if (loading) {
    return (
      <div className='loading-container'>
        <Spin size='large' />
      </div>
    );
  }
  if (!order) {
    return (
      <div className='loading-container'>
        <p className='error-text'>Order not found!</p>
      </div>
    );
  }

  // Data Source for Table
  const dataSource: OrderItemType[] = order.items.map((item,index:number) => ({
    key: index,
    product: item.product,
    image: item.product.image,
    qty: item.qty,
    price: item.product.price
  }));
  
  // Render
  return (
    <div className='order-detail-container'>
      {/* Header */}
      <div className='order-header'>
        <ArrowLeftOutlined
          style={{ color: '#007BFF' }}
          onClick={() => router.back()}
          className='back-button'
        />
        <h4 className='order-title'>
          Orders Detail
        </h4>
      </div>
      <div className='divider-main'></div>
      {/* Order Summary */}
      <div className='order-summary-grid'>
        <div>
          <p className='summary-label'>Date</p>
          <p className='summary-value'>
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className='summary-label'>Order #</p>
          <p className='summary-value'>
           {order.orderNo}
          </p>
        </div>
        <div>
          <p className='summary-label'>Products</p>
          <p className='summary-value'>
            {order.items.length}
          </p>
        </div>
        <div>
          <p className='summary-label'>Amount</p>
          <p className='summary-value'>
            ${order.total.toFixed(2)}
          </p>
        </div>
      </div>
      <div className='divider-section'></div>
      <h4 className='product-info-title'>
        Product Information
      </h4>
      {/* Product Table */}
      <div className='table-container'>
        <Table<OrderItemType>
          columns={columns}
          dataSource={dataSource}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1000 }}
          bordered
          rowClassName={() => 'h-12'}
        />
      </div>
    </div>
  );
}
