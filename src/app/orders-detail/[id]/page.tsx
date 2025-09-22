'use client';

// import { useEffect, useState } from 'react';
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Spin, Table } from 'antd';
import type { TableColumnsType } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Image from 'next/image';

// import { OrderItemType, OrderType } from '@/types/order';
import { OrderItemType } from '@/types/order';
import { useAppDispatch, useAppSelector } from '@/redux/store/hooks';
import { fetchOrderDetail, clearOrder } from '@/redux/store/slices/orderDetailSlice';

// Table Columns
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
  }
];

// // Page Component
// export default function OrderDetailPage() {
//   const params = useParams<{ id: string }>();
//   const router = useRouter();
//   const id = params?.id;
//   const [order, setOrder] = useState<OrderType | null>(null);
//   const [loading, setLoading] = useState(true);

//   // Fetch Order Data
//   useEffect(() => {
//     if (!id) return;
//     const fetchOrder = async () => {
//       try {
//         const res = await fetch(`/api/orders/${id}`);
//         const json = await res.json();
//         console.log(res);
//         if (!res.ok) {
//           console.error('Failed to fetch order:', json.error);
//           return;
//         }
//         setOrder(json.order);
//       } catch (err) {
//         console.error('Error fetching order:', err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchOrder();
//   }, [id]);

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
      <div className='flex justify-center items-center min-h-screen'>
        <Spin size='large' />
      </div>
    );
  }
  if (!order) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <p className='text-gray-500'>Order not found!</p>
      </div>
    );
  }

  // Data Source for Table
  const dataSource: OrderItemType[] = order.items.map((item, index) => ({
    key: index,
    product: item.product,
    image: item.product.image,
    qty: item.qty,
    price: item.price
  }));
  
  // Render
  return (
    <div className='pl-4 sm:px-7 md:px-10 lg:px-14 xl:!px-15 bg-[#F8F9FA]'>
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
      <div className='grid tablet:grid-cols-4 small:grid-cols-2 mobile:grid-cols-2 tablet:gap-[122px] small:gap-6 mobile:gap-6 mb-6'>
        <div>
          <p className='font-inter text-xs text-[#979797] pb-[5px]'>Date</p>
          <p className='font-inter text-sm text-[#272B41]'>
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className='font-inter text-xs text-[#979797] pb-[5px]'>Order #</p>
          <p className='font-inter text-sm text-[#272B41]'>
            ORD-#{order.id + 1}
          </p>
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
