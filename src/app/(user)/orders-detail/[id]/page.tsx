'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Spin, Table } from 'antd';
import type { TableColumnsType } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Image from 'next/image';

import { OrderItemType } from '@/types/order';
import { useAppDispatch, useAppSelector } from '@/redux/store/hooks';
import { fetchOrderDetail, clearOrder } from '@/redux/store/slices/order-slice';
import { formatPrice } from '@/lib/utils';

import './page.css';

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
    title: <span className='main-text-color'>Unit Price</span>,
    render: (_, record) => (
    <span className="main-text-color">
      {formatPrice(record.product.price)}
    </span>)
  }, 
  {
    title: <span className='main-text-color'>Quantity</span>,
    dataIndex: 'quantity',
    render: (quantity: number) => (
    <span className='main-text-color'>
      {quantity}
    </span>
  )
  },
  {
    title: <span className='main-text-color'>Total Price</span>,
    render: (_, record) => (
    <span className="main-text-color">
      {formatPrice(record.product.price * record.quantity)}
    </span>)
  },
  {
    title: <span className='main-text-color'>Tax(10%)</span>,
    dataIndex: 'quantity',
    render: (_, record) => (
    <span className="main-text-color">
      {formatPrice(record.product.price * record.quantity * 0.1)}
    </span>)
  }
];

 export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { order, loading } = useAppSelector((state) => state.orders);

  useEffect(() => {
    if (params?.id) {
      dispatch(fetchOrderDetail(params.id));
    };
    return () => {
      dispatch(clearOrder());
    };
  }, [dispatch, params?.id]);
  
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
  const dataSource: OrderItemType[] = order.items.map((item,index:number) => ({
    key: index,
    product: item.product,
    image: item.product.image,
    quantity: item.quantity,
    price: item.product.price
  }));
  
  return (
    <div className='order-detail-container'>
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
            {formatPrice(order.total)}
          </p>
        </div>
      </div>
      <div className='divider-section'></div>
      <h4 className='product-info-title'>
        Product Information
      </h4>
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
