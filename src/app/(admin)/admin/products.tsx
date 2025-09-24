// 'use client';

// import React, { useState, useEffect } from 'react';
// import { Table, Avatar, Space, Spin, Button } from 'antd';
// import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
// import { ProductType } from '@/types/product';
// // import { useRouter } from 'next/navigation';
// import AddProductModal from '@/components/add_product';

// const ProductsContent: React.FC = () => {
//   const [products, setProducts] = useState<ProductType[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [page, setPage] = useState(1);
//   const [pageSize, setPageSize] = useState(12);
//   const [total, setTotal] = useState(0);
//   // const router = useRouter();
//   const [openModal, setOpenModal] = useState(false);

//   const fetchProducts = async (pageNum: number, limit: number) => {
//     setLoading(true);
//     try {
//       const res = await fetch(`/api/products?page=${pageNum}&limit=${limit}`);
//       const data = await res.json();
//       setProducts(data.products);
//       setTotal(data.total);
//     } catch (err) {
//       console.error('❌ Failed to fetch products:', err);
//     }
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchProducts(page, pageSize);
//   }, [page, pageSize]);

//   const columns = [
//     {
//       title: 'Title',
//       dataIndex: 'title',
//       key: 'title',
//       render: (text: string, record: ProductType) => (
//         <Space>
//           <Avatar shape='square' size={24} src={record.image} />
//           <span className='font-inter font-normal text-[12px] leading-[100%]'>{text}</span>
//         </Space>
//       )
//     },
//     {
//       title: 'Price',
//       dataIndex: 'price',
//       key: 'price',
//       render: (price: number) => `$${price.toFixed(2)}`
//     },
//     {
//       title: 'Stock',
//       dataIndex: 'stock',
//       key: 'stock'
//     },
//     {
//       title: 'Actions',
//       key: 'actions',
//       render: () => (
//         <Space>
//           <Button type='text' icon={<EditOutlined />} />
//           <Button danger type='text' icon={<DeleteOutlined />} />
//         </Space>
//       )
//     }
//   ];

//   return (
//     <>
//       <div className='flex small:flex-col small:pt-5 small:pb-3 small:gap-y-2 mobile:flex-col mobile:pt-6 mobile:pb-4 mobile:gap-y-3 tablet:flex-row tablet:justify-between tablet:items-center tablet:pt-8 tablet:pb-6'>
//         <h4 className='font-inter font-medium text-2xl leading-[28.8px] text-[#007BFF] !mb-0'>
//           Products
//         </h4>
//         <div className='flex items-center gap-6'>
//           {/* <Button onClick={() => {router.push('admin_dashboard/add_product');}} className='!w-[203px] !h-[36px] !text-[#007BFF] !border-[#007BFF] hover:!bg-[#007BFF] hover:!text-white font-inter font-normal text-base leading-6 tracking-normal text-center align-middle'>
//             + Add a single Product
//           </Button> */}
//            <Button
//             onClick={() => setOpenModal(true)}
//             className='!w-[203px] !h-[36px] !text-[#007BFF] !border-[#007BFF] hover:!bg-[#007BFF] hover:!text-white font-inter font-normal text-base leading-6 tracking-normal text-center align-middle'
//           >
//             + Add a single Product
//           </Button>
//           <Button className='!w-[203px] !h-[36px] !text-[#007BFF] !border-[#007BFF] hover:!bg-[#007BFF] hover:!text-white font-inter font-normal text-base leading-6 tracking-normal text-center align-middle'>
//             + Add Multiple Products
//           </Button>
//         </div>
//       </div>

//       {loading ? (
//         <div className='flex justify-center'>
//           <Spin size='large' />
//         </div>
//       ) : (
//         <Table
//           dataSource={products}
//           columns={columns}
//           rowKey='id'
//           pagination={{
//             current: page,
//             pageSize: pageSize,
//             total: total,
//             onChange: (p, ps) => {
//               setPage(p);
//               setPageSize(ps);
//             }
//           }}
//           className='[&_.ant-table-cell]:!py-2 [&_.ant-table-thead_.ant-table-cell]:!text-[#535E63]'
//         />
//       )}
//       {openModal && (
//         <AddProductModal
//           open={openModal}
//           setOpen={setOpenModal}
//         />
//       )}
//     </>
//   );
// };

// export default ProductsContent;
'use client';

import React, { useState, useEffect } from 'react';
import { Table, Avatar, Space, Spin, Button } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { ProductType } from '@/types/product';
import ProductModal, { ProductFormValues } from '@/components/product_modal';
import UploadProductsModal from '@/components/upload_product';
import type { UploadFile } from 'antd/es/upload/interface';
import RemoveProductModal from '@/components/delete-product';

const ProductsContent: React.FC = () => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const [openUploadModal, setOpenUploadModal] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editData, setEditData] = useState<ProductFormValues | undefined>(
    undefined
  );

   const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ProductType | null>(
    null
  );

  const fetchProducts = async (pageNum: number, limit: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products?page=${pageNum}&limit=${limit}`);
      const data = await res.json();
      setProducts(data.products);
      setTotal(data.total);
    } catch (err) {
      console.error('❌ Failed to fetch products:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts(page, pageSize);
  }, [page, pageSize]);

  const handleSubmit = (values: ProductFormValues) => {
    if (modalMode === 'add') {
      console.log('👉 Add Product:', values);
    } else {
      console.log('👉 Update Product:', values);
    }
  };
  const handleUpload = (files: UploadFile[]) => {
    console.log('👉 Upload Multiple Products:', files);
  };
  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      console.log('👉 Delete Product:', productToDelete.id);
      await fetch(`/api/products/${productToDelete.id}`, {
        method: 'DELETE'
      });

      // refresh list
      fetchProducts(page, pageSize);
    } catch (err) {
      console.error('❌ Failed to delete product:', err);
    } finally {
      setOpenDeleteModal(false);
      setProductToDelete(null);
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: ProductType) => (
        <Space>
          <Avatar shape='square' size={24} src={record.image} />
          <span className='font-inter font-normal text-[12px] leading-[100%]'>
            {text}
          </span>
        </Space>
      )
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `$${price.toFixed(2)}`
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: ProductType) => (
        <Space>
          <Button
            type='text'
            icon={<EditOutlined />}
            onClick={() => {
              setModalMode('edit');
              setEditData({
                id:record.id,
                name: record.title,
                price: String(record.price),
                quantity: String(record.stock),
                image: record.image
              });
              setOpenModal(true);
            }}
          />
          <Button
            danger
            type="text"
            icon={<DeleteOutlined />}
            onClick={() => {
              setProductToDelete(record);
              setOpenDeleteModal(true);
            }}
          />
        </Space>
      )
    }
  ];

  return (
    <>
      <div className='flex justify-between items-center pt-6 pb-4'>
        <h4 className='font-inter font-medium text-2xl text-[#007BFF] !mb-0'>
          Products
        </h4>
        <div className='flex items-center gap-6'>
          <Button
            onClick={() => {
              setModalMode('add');
              setEditData(undefined);
              setOpenModal(true);
            }}
            className='!w-[203px] !h-[36px] !text-[#007BFF] !border-[#007BFF] hover:!bg-[#007BFF] hover:!text-white'
          >
            + Add a single Product
          </Button>
          <Button
            onClick={() => setOpenUploadModal(true)}
            className='!w-[203px] !h-[36px] !text-[#007BFF] !border-[#007BFF] hover:!bg-[#007BFF] hover:!text-white'
          >
            + Add Multiple Products
          </Button>
        </div>
      </div>

      {loading ? (
        <div className='flex justify-center'>
          <Spin size='large' />
        </div>
      ) : (
        <Table
          dataSource={products}
          columns={columns}
          rowKey='id'
          pagination={{
            current: page,
            pageSize,
            total,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            }
          }}
          className='[&_.ant-table-cell]:!py-2 [&_.ant-table-thead_.ant-table-cell]:!text-[#535E63]'
        />
      )}

      {openModal && (
        <ProductModal
          open={openModal}
          setOpen={setOpenModal}
          mode={modalMode}
          initialValues={editData}
          onSubmit={handleSubmit}
        />
      )}
      {openUploadModal && (
        <UploadProductsModal
          open={openUploadModal}
          setOpen={setOpenUploadModal}
          onUpload={handleUpload}
        />
      )}
      {openDeleteModal && productToDelete && (
        <RemoveProductModal
          onConfirm={handleDeleteConfirm}
          onCancel={() => setOpenDeleteModal(false)}
          title="Remove Product"
          message={`Are You Sure You Want To Delete "${productToDelete.title}"?`}
        />
      )}
    </>
  );
};

export default ProductsContent;
