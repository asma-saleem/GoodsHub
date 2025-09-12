// 'use client';
// import React, { useState } from 'react';
// import { Table } from 'antd';
// import type { TableColumnsType, TableProps } from 'antd';
// import { ArrowLeftOutlined } from '@ant-design/icons';
// import Header from '@/components/header';
// import { Button } from 'antd';
// import Image from 'next/image';
// // import RemoveProductModal from '@/components/delete-product';
// // import RemoveProductModal from '@/components/delete-product';

// type TableRowSelection<T extends object = object> =
//   TableProps<T>['rowSelection'];

// interface DataType {
//   key: number;
//   product: string;
//   image: string;
//   color: { name: string; code: string };
//   size: number;
//   qty: number;
//   price: number;
// }

// const App: React.FC = () => {

//   const columns: TableColumnsType<DataType> = [
//   {
//     title: 'Product',
//     dataIndex: 'product',
//     className:'!pl-0',
//     render: (_, record) => (
//       <div className='flex items-center gap-3'>
//         <Image
//           src={record.image}
//           alt={record.product}
//           width={24}
//           height={24}
//           className='object-cover rounded'
//         />
//         <span className='font-inter font-normal text-xs text-[#495057]'>{record.product}</span>
//       </div>
//     )
//   },
//   {
//     title: 'Color',
//     dataIndex: 'color',
//     render: (color) => (
//       <div className='flex items-center gap-2'>
//         <span
//           className='w-3 h-3 rounded-full inline-block'
//           style={{ backgroundColor: color.code }}
//         />
//         <span className='font-inter font-normal text-[12px] leading-4 tracking-normal text-[#535E63]'>{color.name}</span>
//       </div>
//     )
//   },
//   {
//     title: 'Size',
//     dataIndex: 'size'
//   },
//   {
//     title: 'Qty',
//     dataIndex: 'qty',
//     render: (qty) => (
//       <div className='flex items-center gap-2'>
//         <button className='border px-3 py-1 rounded text-blue-500' style={{ borderColor: '#DFDFDF' }}>-</button>
//         <span className='border px-[31.5px] py-1 rounded' style={{ borderColor: '#DFDFDF' }}>{qty.toString().padStart(2, '0')}</span>
//         <button className='border px-[10.5px] py-1 rounded text-blue-500' style={{ borderColor: '#DFDFDF' }}>+</button>
//       </div>
//     )
//   },
//   {
//     title: 'Price',
//     dataIndex: 'price',
//     render: (price) => `$${price.toFixed(2)}`
//   },
//   {
//     title: 'Actions',
//     dataIndex: 'actions',
//     // render: (_, record) => (
//      render: ()=>(
//     <Image
//       src='/delete.png'
//       alt='Delete'
//       width={13}
//       height={15}
//       className='cursor-pointer'
//       // onClick={() => handleRemove(record.key)}
//     />
//   )
//   }
// ];

// const products = [
//   {
//     key: 1,
//     product: 'Cargo Trousers for Men - 6 Pocket Trousers - Olive',
//     image: '/shirts.png',
//     color: { name: 'Olive', code: '#556B2F' },
//     size: 32,
//     qty: 1,
//     price: 59.99
//   },
//   {
//     key: 2,
//     product: 'Cargo Trousers for Men - 6 Pocket Trousers - Beige',
//     image: '/shirts.png',
//     color: { name: 'Beige', code: '#D2A679' },
//     size: 34,
//     qty: 2,
//     price: 64.99
//   },
//   {
//     key: 3,
//     product: 'Cargo Trousers for Men - 6 Pocket Trousers - Black',
//     image: '/shirts.png',
//     color: { name: 'Black', code: '#000000' },
//     size: 36,
//     qty: 1,
//     price: 69.99
//   },
//    {
//     key: 4,
//     product: 'Cargo Trousers for Men - 6 Pocket Trousers - Olive',
//     image: '/shirts.png',
//     color: { name: 'Olive', code: '#556B2F' },
//     size: 32,
//     qty: 1,
//     price: 59.99
//   },
//   {
//     key: 5,
//     product: 'Cargo Trousers for Men - 6 Pocket Trousers - Beige',
//     image: '/shirts.png',
//     color: { name: 'Beige', code: '#D2A679' },
//     size: 34,
//     qty: 2,
//     price: 64.99
//   },
//   {
//     key: 6,
//     product: 'Cargo Trousers for Men - 6 Pocket Trousers - Black',
//     image: '/shirts.png',
//     color: { name: 'Black', code: '#000000' },
//     size: 36,
//     qty: 1,
//     price: 69.99
//   }
// ];

// // AntD Table datasource ke liye:
// const dataSource: DataType[] = products.map((item, i) => ({
//   key: i,
//   product: item.product,
//   image: item.image,
//   color: item.color,
//   size: item.size,
//   qty: item.qty,
//   price: item.price
// }));
//   const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

//   const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
//     console.log('selectedRowKeys changed: ', newSelectedRowKeys);
//     setSelectedRowKeys(newSelectedRowKeys);
//   };

//   const rowSelection: TableRowSelection<DataType> = {
//   selectedRowKeys,
//   onChange: onSelectChange
// };

//   return (
//     <div>
//       {' '}
//       <Header />
//       <div className='pl-4 sm:px-7 md:px-10 lg:px-14 xl:!px-15 bg-[#ffffff]'>
//         <div className='flex gap-2 pt-6 pb-6 xl:pt-8'>
//           <ArrowLeftOutlined style={{ color: '#007BFF' }} />
//           <h4 className='font-inter font-medium text-[24px] leading-[28.8px] text-[#007BFF] mb-0'>
//             Your Shopping Bag
//           </h4>
//         </div>
//         <div className='overflow-x-auto'>
//         <Table<DataType>
//         rowSelection={rowSelection}
//         columns={columns}
//         dataSource={dataSource}
//         pagination={{pageSize : 10}}
//         scroll={{ x: 1000 }}
//         bordered
//         rowClassName={() => 'h-12'}
//        />
//       </div>
//       <div className='pr-4'>
//         <div className='flex justify-end items-center gap-3 pt-6 pb-[14px]'>
//        <p className='font-inter font-normal text-sm leading-[21px] text-[#212529]'>
//         Sub Total:
//       </p>
//       <p className='font-inter font-bold text-sm leading-5 text-center text-[#343A40]'>
//         $00000
//       </p>
//     </div>
//     <div className='flex justify-end items-center gap-3'>
//        <p className='font-inter font-normal text-sm leading-[21px] text-[#212529]'>
//         Tax:
//       </p>
//       <p className='font-inter font-bold text-sm leading-5 text-center text-[#343A40]'>
//         $00000
//       </p>
//     </div>
//     <div className='flex justify-end items-center gap-3 pb-6 pt-[14px]'>
//        <p className='font-inter font-normal text-sm leading-[21px] text-[#212529]'>
//         Total:
//       </p>
//       <p className='font-inter font-bold text-sm leading-5 text-center text-[#343A40]'>
//         $00000
//       </p>
//     </div>
//     <div className='flex justify-end items-center pb-[11px] md:pb-[13px] lg:pb-[15px] xl:!pb-[23px]'>
//       <Button className='!px-[142.5] lg:!px-[50px] !py-[15px] !h-[46px] !bg-[#007BFF]'>
//       <div className='font-inter font-normal text-xl leading-[30px] tracking-normal text-center align-middle text-white'>Place Order</div>
//     </Button>
//     </div>
//       </div>

//       </div>
//     </div>
//   );
// };

// export default App;

'use client';
import React, { useState, useMemo } from 'react';
import { Table } from 'antd';
import type { TableColumnsType, TableProps } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Header from '@/components/header';
import { Button } from 'antd';
import Image from 'next/image';
import RemoveProductModal from '@/components/delete-product';

type TableRowSelection<T extends object = object> =
  TableProps<T>['rowSelection'];

interface DataType {
  key: number;
  product: string;
  image: string;
  color: { name: string; code: string };
  size: number;
  qty: number;
  price: number;
}

const App: React.FC = () => {
  const products: DataType[] = [
    {
      key: 1,
      product: 'Cargo Trousers for Men - 6 Pocket Trousers - Olive',
      image: '/dashboard-image-1.png',
      color: { name: 'Olive', code: '#556B2F' },
      size: 32,
      qty: 1,
      price: 59.99
    },
    {
      key: 2,
      product: 'Cargo Trousers for Men - 6 Pocket Trousers - Beige',
      image: '/dashboard-image-1.png',
      color: { name: 'Beige', code: '#D2A679' },
      size: 34,
      qty: 2,
      price: 64.99
    },
    {
      key: 3,
      product: 'Cargo Trousers for Men - 6 Pocket Trousers - Black',
      image: '/dashboard-image-1.png',
      color: { name: 'Black', code: '#000000' },
      size: 36,
      qty: 5,
      price: 69.99
    },
    {
      key: 4,
      product: 'Cargo Trousers for Men - 6 Pocket Trousers - Olive',
      image: '/dashboard-image-1.png',
      color: { name: 'Olive', code: '#556B2F' },
      size: 32,
      qty: 6,
      price: 59.99
    },
    {
      key: 5,
      product: 'Cargo Trousers for Men - 6 Pocket Trousers - Beige',
      image: '/dashboard-image-1.png',
      color: { name: 'Beige', code: '#D2A679' },
      size: 34,
      qty: 2,
      price: 64.99
    },
    {
      key: 6,
      product: 'Cargo Trousers for Men - 6 Pocket Trousers - Black',
      image: '/dashboard-image-1.png',
      color: { name: 'Black', code: '#000000' },
      size: 36,
      qty: 1,
      price: 69.99
    }
  ];

  // Move products into state so qty can be updated
  const [dataSource, setDataSource] = useState<DataType[]>(products);
  const [deleteTarget, setDeleteTarget] = useState<DataType | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // Update qty function
  const updateQty = (key: number, type: 'inc' | 'dec') => {
    setDataSource((prev) =>
      prev.map((item) =>
        item.key === key
          ? {
              ...item,
              qty:
                type === 'inc' ? item.qty + 1 : item.qty > 1 ? item.qty - 1 : 1
            }
          : item
      )
    );
  };

  // Calculate subtotal, tax, and total dynamically
  const { subTotal, tax, total } = useMemo(() => {
    const subTotal = dataSource.reduce(
      (sum, item) => sum + item.qty * item.price,
      0
    );
    const tax = subTotal * 0.1; // 10% tax
    const total = subTotal + tax;
    return { subTotal, tax, total };
  }, [dataSource]);

  const handleDelete = (key: number) => {
    setDataSource((prev) => prev.filter((item) => item.key !== key));
    setDeleteTarget(null);
  };
  const columns: TableColumnsType<DataType> = [
    {
      title: 'Product',
      dataIndex: 'product',
      className: '!pl-0',
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
      title: 'Color',
      dataIndex: 'color',
      render: (color) => (
        <div className='flex items-center gap-2'>
          <span
            className='w-3 h-3 rounded-full inline-block'
            style={{ backgroundColor: color.code }}
          />
          <span className='font-inter font-normal text-[12px] leading-4 tracking-normal text-[#535E63]'>
            {color.name}
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

  const rowSelection: TableRowSelection<DataType> = {
    selectedRowKeys,
    onChange: onSelectChange
  };

  return (
    <div>
      <Header />
      <div className='pl-4 sm:px-7 md:px-10 lg:px-14 xl:!px-15 bg-[#ffffff]'>
        <div className='flex gap-2 pt-6 pb-6 xl:pt-8'>
          <ArrowLeftOutlined style={{ color: '#007BFF' }} />
          <h4 className='font-inter font-medium text-[24px] leading-[28.8px] text-[#007BFF] mb-0'>
            Your Shopping Bag
          </h4>
        </div>
        <div className='overflow-x-auto'>
          <Table<DataType>
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
              <div className='font-inter font-normal text-xl leading-[30px] tracking-normal text-center align-middle text-white'>
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
