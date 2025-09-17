'use client';
import React, { useState } from 'react';
import { Input, Select } from 'antd';
import './globals.css';
import ProductGrid from '@/components/grid';
import Header from '@/components/header';
export default function Page() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt_desc');
  return (
    <div>
      <Header />
      <div className='mobile:px-4 tablet:px-[105px] xl:px-14 desktop:px-[60px] bg-[#F8F9FA] max-w-[1600px] m-auto pb-15'>
        <div className='flex mobile:flex-col mobile:pt-6 mobile:pb-4 mobile:gap-y-3 tablet:flex-row tablet:justify-between tablet:items-center tablet:pt-8 tablet:pb-6'>
          <h4 className='font-inter font-medium text-2xl leading-[28.8px] text-[#007BFF] !mb-0'>
            Our Products
          </h4>
          <div className='flex items-center gap-6'>
            <div
              className='[&_.ant-btn]:!bg-[#E2E8F0]
                [&_.ant-btn-icon]:!text-gray-600'
            >
              <Input.Search
                placeholder='Search by user & order ID'
                className='mobile:!w-[234px] tablet:!w-[350px] h-[36px] rounded-lg'
                onSearch={(value) => setSearchTerm(value)}
                allowClear
              />
            </div>
            <Select
              showSearch
              style={{ width: 200 }}
              className='!w-[138px] !h-[36px] rounded-lg'
              placeholder='Sort by:'
              optionFilterProp='label'
              onChange={(value) => setSortBy(value)}
              filterSort={(optionA, optionB) =>
                (optionA?.label ?? '')
                  .toLowerCase()
                  .localeCompare((optionB?.label ?? '').toLowerCase())
              }
              options={[
                { value: 'createdAt_desc', label: 'Newest' }, // latest products
                { value: 'price_asc', label: 'Price: Low to High' },
                { value: 'price_desc', label: 'Price: High to Low' },
                { value: 'title_asc', label: 'Title: A-Z' },
                { value: 'title_desc', label: 'Title: Z-A' }
              ]}
            />
          </div>
        </div>
        <ProductGrid searchTerm={searchTerm} sortBy={sortBy}/>
      </div>
    </div>
  );
}
