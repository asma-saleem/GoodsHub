'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Button } from 'antd';
import type { TableColumnsType } from 'antd';
import { ArrowLeftOutlined, ExportOutlined } from '@ant-design/icons'; // ExportOutlined use karo actions ke liye
import Link from 'next/link';
interface OrderType {
  key: number;
  date: string;
  orderNo: string;
  user: number;
  products: number;
  amount: number;
}

const rawData = [
  {
    date: '22 March 2023',
    orderNo: '1001',
    user: 12,
    products: 3,
    amount: 250.0
  },
  {
    date: '25 March 2023',
    orderNo: '1002',
    user: 8,
    products: 5,
    amount: 420.5
  },
  {
    date: '28 March 2023',
    orderNo: '1003',
    user: 20,
    products: 2,
    amount: 99.99
  }
];

const dataSource: OrderType[] = rawData.map((item, index) => ({
  key: index,
  ...item
}));
const Orders: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  const columns: TableColumnsType<OrderType> = [
  {
    title: 'Date',
    dataIndex: 'date'
  },
  {
    title: 'Order #',
    dataIndex: 'orderNo',
    render: (val) => <span>${val}</span>
  },
  {
    title: 'User',
    dataIndex: 'user'
  },
  {
    title: 'Product(s)',
    dataIndex: 'products'
  },
  {
    title: 'Amount',
    dataIndex: 'amount',
    render: (amount) => <span>${amount.toFixed(2)}</span>
  },
  {
    title: 'Actions',
    dataIndex: 'actions',
    render: () => (
      <Button
        type='text'
        icon={<ExportOutlined />}
        className='!text-[#000000]'
         onClick={() => router.push('/orders-detail')}
      />
    )
  }
];
  return (
    <div>
      <div className='pl-4 sm:px-7 md:px-10 lg:px-14 xl:!px-15 bg-[#F9FAFB] min-h-screen'>
        {/* Top Header */}
        <div className='flex items-center gap-2 pt-[30px] pb-6 xl:pt-8'>
          <Link href='/dashboard'>
            <ArrowLeftOutlined style={{ color: '#007BFF' }} />
          </Link>
          <h4 className='font-inter font-medium text-[24px] leading-[28.8px] text-[#007BFF] !mb-0'>
            Orders
          </h4>
        </div>
        {/* Table */}
        <div className='overflow-x-auto'>
          <Table<OrderType>
            columns={columns}
            dataSource={dataSource}
            pagination={{
              current: currentPage,
              pageSize: 10,
              total: dataSource.length,
              onChange: (page) => setCurrentPage(page),
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
          />
        </div>
        {/* Footer Count + Pagination */}
        {/* <div className='flex justify-between items-center py-4 px-2 [&_.ant-pagination]:!m-0'>
          <p className='text-[#90A4AE]'>{dataSource.length} Total Count</p>
        </div> */}
      </div>
    </div>
  );
};
export default Orders;
