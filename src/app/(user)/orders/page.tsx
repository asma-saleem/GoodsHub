'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Button } from 'antd';
import type { TableColumnsType } from 'antd';
import { Spin } from 'antd';
import { ArrowLeftOutlined, ExportOutlined } from '@ant-design/icons';
import Link from 'next/link';
// import { useSession } from 'next-auth/react';

import { OrderType } from '@/types/order';
import { useAppDispatch, useAppSelector } from '@/redux/store/hooks';
import { fetchOrders, setPage } from '@/redux/store/slices/ordersSlice';


const Orders: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data, total, loading, currentPage } = useAppSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrders({ page: currentPage, pageSize: 10 }));
  }, [dispatch, currentPage]);

// //  Component
// const Orders: React.FC = () => {
//   const { data: session } = useSession();
//   const router = useRouter();

//   const [orders, setOrders] = useState<OrderType[]>([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [loading, setLoading] = useState(true);
//   const [total, setTotal] = useState(0);

//   const email = session?.user?.email ?? null;

//   // Fetch Orders
//   useEffect(() => {
//     if (!email) return;

//     const fetchOrders = async (page = 1, pageSize = 10) => {
//       try {
//         const res = await fetch(
//           `/api/orders?page=${page}&pageSize=${pageSize}`,
//           {
//             headers: { 'Content-Type': 'application/json' },
//             credentials: 'same-origin'
//           }
//         );
//         if (!res.ok) {
//           console.error('Failed to fetch orders');
//           setLoading(false);
//           return;
//         }
//         const json = await res.json();

//         // Map API response to OrderType[]
//         const mappedOrders: OrderType[] = (json.orders || []).map(
//           (order: OrderType, index: number) => ({
//             id: order.id,
//             key: index,
//             date: new Date(order.createdAt).toLocaleDateString(),
//             orderNo: order.id || `ORD-${index + 1}`,
//             products: order.items?.length || 0,
//             amount: order.total || 0
//           })
//         );
//         setOrders(mappedOrders);
//         setTotal(json.total);
//       } catch (error) {
//         console.error('Error fetching orders:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrders(currentPage);
//   }, [email, currentPage]);

  //  Table columns
  const columns: TableColumnsType<OrderType> = [
    {
      title: 'Date',
      dataIndex: 'date'
    },
    {
      title: 'Order #',
      dataIndex: 'orderNo',
      render: (val: string) => <span>#{val}</span>
    },
    {
      title: 'Product(s)',
      dataIndex: 'products'
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      render: (amount: number) => <span>${amount.toFixed(2)}</span>
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      render: (_, record) => (
        <Button
          type='text'
          icon={<ExportOutlined />}
          className='!text-[#000000]'
          onClick={() => router.push(`/orders-detail/${record.id}`)}
        />
      )
    }
  ];

  // Loading State
  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <Spin size='large' />
      </div>
    );
  }

  // Render
  return (
    <div>
      <div className='pl-4 sm:px-7 md:px-10 lg:px-14 xl:!px-15 bg-[#F9FAFB] min-h-screen'>
        <div className='flex items-center gap-2 pt-[30px] pb-6 xl:pt-8'>
          <Link href='/'>
            <ArrowLeftOutlined
              style={{ color: '#007BFF' }}
              onClick={() => router.back()}
            />
          </Link>
          <h4 className='font-inter font-medium text-[24px] leading-[28.8px] text-[#007BFF] !mb-0'>
            Orders
          </h4>
        </div>

        <div className='overflow-x-auto'>
          <Table<OrderType>
            columns={columns}
            // dataSource={orders}
            dataSource={data}
            pagination={{
              current: currentPage,
              pageSize: 10,
              total: total,
              //onChange: (page) => setCurrentPage(page),
              onChange: (page) => dispatch(setPage(page)),
              showSizeChanger: false,
              showTotal: (total) => (
                <span className='absolute left-0 font-inter font-normal text-[16px] leading-6 text-[#868E96]'>
                  {total} Total Count
                </span>
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
