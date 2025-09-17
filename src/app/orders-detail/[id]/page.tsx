'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Table } from 'antd';
import type { TableColumnsType } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { OrderItemType, OrderType } from '@/types/order';


// interface OrderItemType {
//   key: number;
//   product: string;
//   image: string;
//   stock: number;
//   qty: number;
//   price: number;
// }


const columns: TableColumnsType<OrderItemType> = [
  {
    title: 'Title',
    dataIndex: 'product',
    render: (_, record: OrderItemType) => (
      <div className='flex items-center gap-3'>
        <Image
          src={record.product.image}
          alt={record.product.title}
          width={24}
          height={24}
          className='object-cover rounded'
        />
        <span className='font-inter font-normal text-xs text-[#495057]'>
          {record.product.title}
        </span>
      </div>
    )
  },
  {
    title: 'Price',
    dataIndex: 'price',
    render: (price: number) => `$${price.toFixed(2)}`
  },
  {
    title: 'Quantity',
    dataIndex: 'qty'
  },
  {
    title: 'Stock',
    dataIndex: 'stock'
  }
];

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params?.id);
  const [order, setOrder] = useState<OrderType | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${id}`);
        const json = await res.json();
        if (!res.ok) {
          console.error('Failed to fetch order:', json.error);
          return;
        }
        setOrder(json.order);
      } catch (err) {
        console.error('Error fetching order:', err);
      }
    };
    fetchOrder();
  }, [id]);

  if (!order) return <p className='p-4'>Loading...</p>;
  console.log(order.items);
  const dataSource: OrderItemType[] = order.items.map(
    (item, index) => ({
      key: index,
      product: item.product,
      image: item.product.image,
      stock: item.product.stock,
      qty: item.qty,
      price: item.price
    })
  );

  return (
    <div className='pl-4 sm:px-7 md:px-10 lg:px-14 xl:!px-15 bg-[#ffffff]'>
      {/* Header */}
      <div className='flex gap-2 pt-6 pb-6 xl:pt-8'>
        <ArrowLeftOutlined
          style={{ color: '#007BFF' }}
          onClick={() => router.back()}
          className='cursor-pointer'
        />
        <h4 className='font-inter font-medium text-[24px] leading-[28.8px] text-[#007BFF] mb-0'>
          Orders Detail
        </h4>
      </div>
      <div className='border-t border-[#979797] mb-6'></div>

      {/* Order Summary */}
      <div className='grid grid-cols-5 gap-[122px] mb-6'>
        <div>
          <p className='font-inter text-xs text-[#979797] pb-[5px]'>Date</p>
          <p className='font-inter text-sm text-[#272B41]'>
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className='font-inter text-xs text-[#979797] pb-[5px]'>Order #</p>
          <p className='font-inter text-sm text-[#272B41]'>ORD-#{order.id + 1}</p>
        </div>
        <div>
          <p className='font-inter text-xs text-[#979797] pb-[5px]'>UserId</p>
          <p className='font-inter text-sm text-[#272B41]'>{order.userId}</p>
        </div>
        <div>
          <p className='font-inter text-xs text-[#979797] pb-[5px]'>Products</p>
          <p className='font-inter text-sm text-[#272B41]'>
            {order.items.length}
          </p>
        </div>
        <div>
          <p className='font-inter text-xs text-[#979797] pb-[5px]'>Amount</p>
          <p className='font-inter text-sm text-[#272B41]'>
            ${order.total.toFixed(2)}
          </p>
        </div>
      </div>

      <div className='border-t border-[#DEE2E6] mb-6 mt-8'></div>
      <h4 className='font-inter font-medium text-[20px] leading-[24px] text-[#002050] pb-4'>
        Product Information
      </h4>

      {/* Product Table */}
      <div className='overflow-x-auto'>
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
