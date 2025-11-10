'use client';
import React, { useState, useEffect } from 'react';
import { Select, Input } from 'antd';

import ProductGrid from '@/components/grid/grid';
import Header from '@/components/header/header';
import './page.css';

export default function Page() {
  
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt_desc');
  
  useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedTerm(searchTerm); 
  }, 700);

  return () => clearTimeout(timer);
}, [searchTerm]);

  return (
    <div>
      <Header />
      <div className='dashboard-container'>
        <div className='dashboard-subcontainer'>
          <h4 className='dashboard-title'>
            Our Products
          </h4>
          <div className='search-sort-container'>
            <div
              className='search-container'
            >
              <Input.Search
                placeholder='Search by title'
                className='input-search'
                value={searchTerm}       
                onChange={(e) => setSearchTerm(e.target.value)}  
                onSearch={(value) => setDebouncedTerm(value)}   
                allowClear
              />
            </div>
            <Select
              showSearch
              style={{ width: 200 }}
              className='dashboard-select'
              placeholder='Sort by:'
              value={sortBy || 'createdAt_desc'}
              optionFilterProp='label'
              onChange={(value) => setSortBy(value)}
              filterSort={(optionA, optionB) =>
                (optionA?.label ?? '')
                  .toLowerCase()
                  .localeCompare((optionB?.label ?? '').toLowerCase())
              }
              options={[
                { value: 'createdAt_desc', label: 'Newest First' }, 
                { value: 'createdAt_asc', label: 'Oldest First' },
                { value: 'title_asc', label: 'Title: A-Z' },
                { value: 'title_desc', label: 'Title: Z-A' }
              ]}
            />
          </div>
        </div>
        <ProductGrid searchTerm={debouncedTerm} sortBy={sortBy}/>
      </div>
    </div>
  );
}
