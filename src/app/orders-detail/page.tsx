'use client';
import React from 'react';
import { Table } from 'antd';
import type { TableColumnsType } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Image from 'next/image';


interface DataType {
  key: number;
  product: string;
  image: string;
  stock: number;
  qty: number;
  price: number;
}

const columns: TableColumnsType<DataType> = [
  {
    title: 'Title',
    dataIndex: 'product',
    render: (_, record) => (
      <div className='flex items-center gap-3'>
        <Image
          src={record.image}
          alt={record.product}
          width={24}
          height={24}
          className='object-cover rounded'
        />
        <span className='font-inter font-normal text-xs text-[#495057]'>
          {record.product}
        </span>
      </div>
    )
  },
  {
    title: 'Price',
    dataIndex: 'price',
    render: (price) => `$${price.toFixed(2)}`
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

const dataSource: DataType[] = Array.from({ length: 80 }).map<DataType>(
  (_, i) => ({
    key: i,
    product: `Cargo Trousers for Men - 6 Pocket Trousers - 6 Pocket Cargo Trousers in all Colors - Cargo Trouser ${i}`,
    image: '/dashboard-image-1.png', // public folder mein image
    stock: 34 + (i % 5), // size vary kar raha hai for demo
    qty: 1 + (i % 3), // quantity vary kar raha hai for demo
    price: 49.99 + i // price vary kar raha hai for demo
  })
);

const App: React.FC = () => {

  return (
    <div>
      {' '}
      <div className='pl-4 sm:px-7 md:px-10 lg:px-14 xl:!px-15 bg-[#ffffff]'>
        <div className='flex gap-2 pt-6 pb-6 xl:pt-8'>
          <ArrowLeftOutlined style={{ color: '#007BFF' }} />
          <h4 className='font-inter font-medium text-[24px] leading-[28.8px] text-[#007BFF] mb-0'>
            Orders Detail
          </h4>
        </div>
        <div className="border-t border-[#979797] mb-6"></div>
        {/* Order Summary Section */}
        <div className='grid grid-cols-5 gap-[122px] mb-6'>
          <div>
            <p className='font-inter font-normal text-[12.8px] leading-[19.2px] align-middle text-[#979797] pb-[5px]'>Date</p>
            <p className='font-inter font-normal text-[14px] leading-[20px] align-middle text-[#272B41]'>23 March 2023</p>
          </div>
          <div>
            <p className='font-inter font-normal text-[12.8px] leading-[19.2px] align-middle text-[#979797] pb-[5px]'>Order #</p>
            <p className='font-inter font-normal text-[14px] leading-[20px] align-middle text-[#272B41]'>342599</p>
          </div>
          <div>
            <p className='font-inter font-normal text-[12.8px] leading-[19.2px] align-middle text-[#979797] pb-[5px]'>User</p>
            <p className='font-inter font-normal text-[14px] leading-[20px] align-middle text-[#272B41]'>Jackson Smith</p>
          </div>
          <div>
            <p className='font-inter font-normal text-[12.8px] leading-[19.2px] align-middle text-[#979797] pb-[5px]'>Products</p>
            <p className='font-inter font-normal text-[14px] leading-[20px] align-middle text-[#272B41]'>03</p>
          </div>
          <div>
            <p className='font-inter font-normal text-[12.8px] leading-[19.2px] align-middle text-[#979797] pb-[5px]'>Amount</p>
            <p className='font-inter font-normal text-[14px] leading-[20px] align-middle text-[#272B41]'>$00.00</p>
          </div>
        </div>
        <div className="border-t border-[#DEE2E6] mb-6 mt-8"></div>
        <h4 className="font-inter font-medium text-[20px] leading-[24px] text-[#002050] pb-4">
       Product Information
      </h4>

        <div className='overflow-x-auto'>
          <Table<DataType>
            columns={columns}
            dataSource={dataSource}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1000 }}
            bordered
            rowClassName={() => 'h-12'}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
