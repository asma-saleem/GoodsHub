
'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { Table } from 'antd';
import type { TableColumnsType, TableProps } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import Header from '@/components/header';
import RemoveProductModal from '@/components/delete-product';
import { CartItemType } from '@/types/cart';
import { toast } from 'react-toastify';

type TableRowSelection<T extends object = object> =
  TableProps<T>['rowSelection'];

const App: React.FC = () => {
  // Hooks (state & session)
  const [deleteTarget, setDeleteTarget] = useState<CartItemType | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<CartItemType[]>([]);

  const router = useRouter();
  const { data: session } = useSession();

  // Effects
  useEffect(() => {
  const storedCart = localStorage.getItem('cart');
  if (storedCart) {
    const parsed = JSON.parse(storedCart);
    setDataSource(parsed);
    // console.log('Data:', parsed);  
  }
}, []);

 // Handlers
const updateQty = (key: number, type: 'inc' | 'dec') => {
  setDataSource((prev) => {
    const updated = prev.map((item) =>
      item.key === key
        ? {
            ...item,
            qty: type === 'inc' ? item.qty + 1 : item.qty > 1 ? item.qty - 1 : 1
          }
        : item
    );
    localStorage.setItem('cart', JSON.stringify(updated));
    return updated;
  });
};

const handleDelete = (key: number) => {
  setDataSource((prev) => {
    const updated = prev.filter((item) => item.key !== key);
    localStorage.setItem('cart', JSON.stringify(updated));
    return updated;
  });
  setDeleteTarget(null);
};

const handlePlaceOrder = async () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (!cart || cart.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }

    if (!session?.user?.email) {
      router.push('/auth/login');
      return;
    }

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart, email: session.user.email }),
        credentials: 'same-origin'
      });

      if (!res.ok) {
        const err = await res.json();
        console.error('Checkout failed:', err);
        toast.error('Failed to place order');
        return;
      }

      localStorage.removeItem('cart');
      toast.success('Order placed successfully!');
      router.push('/orders');
    } catch (error) {
      console.error(error);
      toast.error('Unexpected error during checkout');
    }
  };

  // Computed values
  const { subTotal, tax, total } = useMemo(() => {
    const subTotal = dataSource.reduce(
      (sum, item) => sum + item.qty * item.price,
      0
    );
    const tax = subTotal * 0.1; // 10% tax
    const total = subTotal + tax;
    return { subTotal, tax, total };
  }, [dataSource]);
  
  // Table configuration
  const columns: TableColumnsType<CartItemType> = [
    {
      title: 'Product',
      dataIndex: 'product',
      className: '!pl-0',
      render: (_, record) => (
        <div className='flex items-center gap-3'>
          <Image
            src={record.image}
            alt={record.title}
            width={24}
            height={24}
            className='object-cover rounded'
          />
          <span className='font-inter font-normal text-xs text-[#495057]'>
            {record.title}
          </span>
        </div>
      )
    },
    {
      title: 'Color',
      dataIndex: 'color',
      render: (_, record) => (
        <div className='flex items-center gap-2'>
          <span
            className='w-3 h-3 rounded-full inline-block'
            style={{ backgroundColor: record.colorCode }}
          />
          <span className='font-inter font-normal text-[12px] leading-4 tracking-normal text-[#535E63]'>
            {record.color}
          </span>
        </div>
      )
    },
    {
      title: 'Size',
      dataIndex: 'size'
    },
    {
      title: 'Qty',
      dataIndex: 'qty',
      render: (qty, record) => (
        <div className='flex items-center gap-2'>
          <button
            className='border px-3 py-1 rounded text-blue-500'
            style={{ borderColor: '#DFDFDF' }}
            onClick={() => updateQty(record.key, 'dec')}
          >
            -
          </button>
          <span
            className='border px-[31.5px] py-1 rounded'
            style={{ borderColor: '#DFDFDF' }}
          >
            {qty.toString().padStart(2, '0')}
          </span>
          <button
            className='border px-[10.5px] py-1 rounded text-blue-500'
            style={{ borderColor: '#DFDFDF' }}
            onClick={() => updateQty(record.key, 'inc')}
          >
            +
          </button>
        </div>
      )
    },
    {
      title: 'Price',
      dataIndex: 'price',
      render: (price, record) => `$${(price * record.qty).toFixed(2)}` // show price * qty
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      render: (_, record) => (
        <Image
          src='/delete.png'
          alt='Delete'
          width={13}
          height={15}
          className='cursor-pointer'
          onClick={() => setDeleteTarget(record)}
        />
      )
    }
  ];

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    console.log('selectedRowKeys changed: ', newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection: TableRowSelection<CartItemType> = {
    selectedRowKeys,
    onChange: onSelectChange
  };

  // Render
  return (
    <div>
      <Header />
      <div className='pl-4 sm:px-7 md:px-10 lg:px-14 xl:!px-15 bg-[#ffffff]'>
        <div className='flex gap-2 pt-6 pb-6 xl:pt-8'>
          <ArrowLeftOutlined style={{ color: '#007BFF' }} onClick={() => router.back()}/>
          <h4 className='font-inter font-medium text-[24px] leading-[28.8px] text-[#007BFF] mb-0'>
            Your Shopping Bag
          </h4>
        </div>
        <div className='overflow-x-auto'>
          <Table<CartItemType>
            rowSelection={rowSelection}
            columns={columns}
            dataSource={dataSource}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1000 }}
            bordered
            rowClassName={() => 'h-12'}
          />
        </div>
        <div className='pr-4'>
          <div className='flex justify-end items-center gap-3 pt-6 pb-[14px]'>
            <p className='font-inter font-normal text-sm leading-[21px] text-[#212529]'>
              Sub Total:
            </p>
            <p className='font-inter font-bold text-sm leading-5 text-center text-[#343A40]'>
              ${subTotal.toFixed(2)}
            </p>
          </div>
          <div className='flex justify-end items-center gap-3'>
            <p className='font-inter font-normal text-sm leading-[21px] text-[#212529]'>
              Tax:
            </p>
            <p className='font-inter font-bold text-sm leading-5 text-center text-[#343A40]'>
              ${tax.toFixed(2)}
            </p>
          </div>
          <div className='flex justify-end items-center gap-3 pb-6 pt-[14px]'>
            <p className='font-inter font-normal text-sm leading-[21px] text-[#212529]'>
              Total:
            </p>
            <p className='font-inter font-bold text-sm leading-5 text-center text-[#343A40]'>
              ${total.toFixed(2)}
            </p>
          </div>
          <div className='flex justify-end items-center pb-[11px] md:pb-[13px] lg:pb-[15px] xl:!pb-[23px]'>
            <Button className='!px-[142.5] lg:!px-[50px] !py-[15px] !h-[46px] !bg-[#007BFF]'>
              <div onClick={handlePlaceOrder} className='font-inter font-normal text-xl leading-[30px] tracking-normal text-center align-middle text-white'>
                Place Order
              </div>
            </Button>
          </div>
        </div>
      </div>
      {deleteTarget && (
        <RemoveProductModal
          onConfirm={() => handleDelete(deleteTarget.key)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default App;
