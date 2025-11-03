'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

import { Table, Avatar, Space, Spin, Button, Input, Select, Modal, Tooltip, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';

import ProductModal, {
  ProductFormValues
} from '@/components/product-modal/product-modal';
import SingleVariantEditModal from '@/components/product-modal/edit-modal';
import { SingleVariantFormValues } from '@/types/product';
import UploadProductsModal from '@/components/upload-product';
import RemoveProductModal from '@/components/delete-product/delete-product';

import { ProductType, ProductVariantType } from '@/types/product';

import { useAppDispatch, useAppSelector } from '@/redux/store/hooks';
import {
  fetchProductsReplace,
  setSearchAndSort,
  setPage,
  deleteVariant,
  updateVariant,
  addVariant,
  deleteProduct
} from '@/redux/store/slices/product-slice';
import { toast } from 'react-toastify';

import './product.css';

const ProductsContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { products, loading, total, page, searchTerm, sortBy } = useAppSelector(
    (state) => state.products
  );

  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editData, setEditData] = useState<ProductFormValues | undefined>();
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ProductType | null>(
    null
  );

  const [openUploadModal, setOpenUploadModal] = useState(false);

  const [openViewModal, setOpenViewModal] = useState(false);
  const [viewProduct, setViewProduct] = useState<ProductType | null>(null);

  const [openSingleVariantModal, setOpenSingleVariantModal] = useState(false);
  const [singleVariantData, setSingleVariantData] = useState<
    SingleVariantFormValues | undefined
  >();

  const [localSearch, setLocalSearch] = useState(searchTerm);
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);

  const [openVariantDeleteModal, setOpenVariantDeleteModal] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState<{
    productId: string;
    variantId: string;
  } | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(localSearch);
    }, 700);

    return () => {
      clearTimeout(handler);
    };
  }, [localSearch]);

  useEffect(() => {
    dispatch(setSearchAndSort({ searchTerm: debouncedTerm, sortBy }));
  }, [debouncedTerm, sortBy, dispatch]);

  useEffect(() => {
    dispatch(
      fetchProductsReplace({ page, query: searchTerm, sortBy, limit: 12 })
    );
  }, [dispatch, page, searchTerm, sortBy]);

  const handleSubmit = (values: ProductFormValues) => {
    if (modalMode === 'add') {
      console.log('Add Product:', values);
    } else {
      console.log('Update Product:', values);
    }
  };

  const handleUpload = (files: UploadFile[]) => {
    console.log('Upload Multiple Products:', files);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    try {
      console.log('Delete Product:', productToDelete.id);
      // await fetch(`/api/products/${productToDelete.id}`, {
      //   method: 'DELETE'
      // });
      await dispatch(deleteProduct(productToDelete.id)).unwrap();
      dispatch(
        fetchProductsReplace({ page: 1, query: searchTerm, sortBy, limit: 12 })
      );
      toast.success('Product marked as inactive successfully!');
    } catch (err) {
      console.error('Failed to delete product:', err);
      toast.error(String(err) || 'Failed to delete product');
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
          <span className='product-title'>{text}</span>
        </Space>
      )
   },
   {
      title: 'Price',
      dataIndex: 'variants',
      key: 'price',
      render: (_: unknown, record: ProductType) => {
        if (!record.variants?.length) return '$0.00';

        const firstVariant = record.variants[0];

        // 🟢 Unique prices only
        const uniquePrices = Array.from(
          new Set(record.variants.map((v) => v.price ?? 0))
        );

        return (
          <Tooltip
           styles={{
              body: {
                backgroundColor: '#f5f5f5', 
                color: '#000',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                borderRadius: 8,
                padding: '8px 10px'
              }
            }}
            title={
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {uniquePrices.map((price, i) => (
                  <Tag key={i} color="grey" style={{ margin: 0 }}>
                    ${price.toFixed(2)}
                  </Tag>
                ))}
              </div>
            }
            placement="bottom"
          >
            <span style={{ cursor: 'pointer', color: '#000000' }}>
              ${firstVariant.price.toFixed(2)}
            </span>
          </Tooltip>
        );
      }
    },
    {
      title: 'Stock',
      dataIndex: 'variants',
      key: 'stock',
      render: (_: unknown, record: ProductType) => {
        if (!record.variants?.length) return 0;

        const firstVariant = record.variants[0];

        // 🔵 Unique stock values only
        const uniqueStocks = Array.from(
          new Set(record.variants.map((v) => v.stock ?? 0))
        );

        return (
          <Tooltip
            styles={{
              body: {
                backgroundColor: '#f5f5f5', 
                color: '#000',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                borderRadius: 8,
                padding: '8px 10px'
              }
            }}
            title={
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {uniqueStocks.map((stock, i) => (
                  <Tag
                    key={i}
                    color={stock > 0 ? 'grey' : 'red'}
                    style={{ margin: 0 }}
                  >
                    {stock}
                  </Tag>
                ))}
              </div>
            }
            placement="bottom"
          >
            <span style={{ cursor: 'pointer', color: '#000000' }}>
              {firstVariant.stock}
            </span>
          </Tooltip>
        );
      }
    },
        {
      title: 'Size',
      dataIndex: 'variants',
      key: 'size',
      render: (_: unknown, record: ProductType) => {
        if (!record.variants?.length) return 'N/A';

        const firstVariant = record.variants[0];

        // 🟢 Unique sizes only
        const uniqueSizes = Array.from(
          new Set(record.variants.map((v) => v.size || 'N/A'))
        );

        return (
          <Tooltip
          styles={{
              body: {
                backgroundColor: '#f5f5f5', 
                color: '#000',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                borderRadius: 8,
                padding: '8px 10px'
              }
            }}
            title={
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {uniqueSizes.map((size, i) => (
                  <Tag key={i} color="grey" style={{ margin: 0 }}>
                    {size}
                  </Tag>
                ))}
              </div>
            }
            placement="bottom"
          >
            <span style={{ cursor: 'pointer', color: '#000000' }}>
              {firstVariant.size ?? 'N/A'}
            </span>
          </Tooltip>
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: ProductType) => (
        <Space>
          <Button
            type='text'
            icon={<EyeOutlined />}
            onClick={() => {
              setViewProduct(record);
              setOpenViewModal(true);
            }}
          />
          <Button
            type='text'
            icon={<EditOutlined />}
            onClick={() => {
              setModalMode('edit');
              setEditData({
                id: record.id,
                name: record.title,
                variants: []
              });
              setOpenModal(true);
            }}
          />

          <Button
            danger
            type='text'
            icon={<DeleteOutlined />}
            onClick={() => {
              setProductToDelete(record);
              setOpenDeleteModal(true);
            }}
          />
          <Button
            type='text'
            className='!w-[100px] !h-[25px] !text-[#007BFF] !border-[#007BFF] hover:!bg-[#007BFF] hover:!text-white'
            onClick={() => {
              setSingleVariantData({
                id: record.id,
                color: '',
                size: '',
                price: '',
                stock: '',
                image: ''
              });
              setOpenSingleVariantModal(true);
            }}
          >
            + Variant
          </Button>
        </Space>
      )
    }
  ];

  return (
    <>
      <div className='products-wrapper'>
        <div className='products-header'>
          <h4 className='products-heading'>Products</h4>
          <div className='products-actions'>
            <Button
              onClick={() => {
                setModalMode('add');
                setEditData(undefined);
                setOpenModal(true);
              }}
              className='btn-outline'
            >
              + Add a single Product
            </Button>
            <Button
              onClick={() => setOpenUploadModal(true)}
              className='btn-outline'
            >
              + Add Multiple Products
            </Button>
            <div className='search-sort-wrapper'>
              <div className='search-container'>
                <Input.Search
                  placeholder='Search by title'
                  className='search-input'
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  onSearch={(value) => setDebouncedTerm(value)}
                  allowClear
                />
              </div>
              <Select
                showSearch
                style={{ width: 200 }}
                className='dashboard-select'
                placeholder='Sort by:'
                optionFilterProp='label'
                value={sortBy || 'createdAt_desc'}
                onChange={(value) =>
                  dispatch(setSearchAndSort({ searchTerm, sortBy: value }))
                }
                options={[
                  { value: 'createdAt_desc', label: 'Newest First' }, 
                  { value: 'createdAt_asc', label: 'Oldest First' },
                  { value: 'price_asc', label: 'Price: Low to High' },
                  { value: 'price_desc', label: 'Price: High to Low' },
                  { value: 'title_asc', label: 'Title: A-Z' },
                  { value: 'title_desc', label: 'Title: Z-A' }
                ]}
              />
            </div>
          </div>
        </div>
      </div>
      {loading ? (
        <div className='loading-container'>
          <Spin size='large' />
        </div>
      ) : (
        <Table
          dataSource={products}
          columns={columns}
          rowKey='id'
          pagination={{
            current: page,
            pageSize: 12,
            total,
            onChange: (p) => {
              dispatch(setPage(p));
            }
          }}
          bordered
          className='products-table'
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
          title='Remove Product'
          message={
            <>
              Are You Sure You Want To Delete{' '}
              <span className='text-red-500'>
                &quot;{productToDelete.title}&quot;
              </span>
              !
            </>
          }
        />
      )}
      {openViewModal && viewProduct && (
        <Modal
          open={openViewModal}
          onCancel={() => setOpenViewModal(false)}
          footer={null}
          width={900}
          title={viewProduct.title}
          style={{ maxHeight: '80vh' }}
          className='product-view-modal'
        >
          <div
            className='flex flex-col gap-4'
            style={{ maxHeight: '70vh', overflowY: 'auto', padding: '20px' }}
          >
            {viewProduct.variants.map(
              (variant: ProductVariantType, idx: number) => (
                <div
                  key={idx}
                  className='flex flex-col md:flex-row items-center justify-between bg-white shadow-lg rounded-lg p-4 hover:shadow-xl transition-shadow'
                >
                  <div className='w-full md:w-24 h-24 relative mb-4 md:mb-0 flex-shrink-0'>
                    {variant.image ? (
                      <Image
                        src={variant.image}
                        alt={variant.color || 'product image'}
                        fill
                        className='object-cover rounded'
                      />
                    ) : (
                      <div className='w-full h-full bg-gray-200 rounded' />
                    )}
                  </div>

                  <div className='flex-1 flex flex-col justify-center text-center md:text-left md:ml-4'>
                    <p className='font-semibold text-gray-800'>
                      {variant.color || '-'}
                    </p>
                    {variant.colorCode && (
                      <span
                        className='inline-block w-5 h-5 rounded-full border border-gray-300'
                        style={{ backgroundColor: variant.colorCode }}
                        title={variant.colorCode}
                      />
                    )}
                    <p className='text-gray-600'>Size: {variant.size || '-'}</p>
                    <p className='text-gray-700 font-bold'>${variant.price}</p>
                    <p className='text-gray-500'>Stock: {variant.stock}</p>
                  </div>
                  <div className='flex gap-2 mt-4 md:mt-0'>
                    <Button
                      type='primary'
                      size='small'
                      icon={<EditOutlined />}
                      onClick={() => {
                        setOpenViewModal(false);
                        setSingleVariantData({
                          id: viewProduct.id, 
                          variantId: variant.id, 
                          colorCode: variant.colorCode,
                          color: variant.color || '',
                          size: variant.size || '',
                          price: String(variant.price ?? ''),
                          stock: String(variant.stock ?? ''),
                          image: variant.image || ''
                        });
                        setOpenSingleVariantModal(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                        danger
                        size='small'
                        icon={<DeleteOutlined />}
                        onClick={() => {
                          setOpenViewModal(false);
                          setVariantToDelete({
                            productId: viewProduct.id,
                            variantId: variant.id
                          });
                          setOpenVariantDeleteModal(true);
                        }}
                      >
                        Delete
                      </Button>
                  </div>
                </div>
              )
            )}
          </div>
        </Modal>
      )}

      {openSingleVariantModal && singleVariantData && (
        <SingleVariantEditModal
          open={openSingleVariantModal}
          setOpen={setOpenSingleVariantModal}
          initialValues={singleVariantData}
          onSubmit={async (values) => {
            try {
              // console.log(JSON.stringify(values));
              // let response;

              // if (values.variantId) {
                
              //   response = await fetch(
              //     `/api/products/${values.id}/variants/${values.variantId}`,
              //     {
              //       method: 'PUT',
              //       headers: { 'Content-Type': 'application/json' },
              //       body: JSON.stringify(values)
              //     }
              //   );
              // } else {
                
              //   response = await fetch(`/api/products/${values.id}/variants`, {
              //     method: 'POST',
              //     headers: { 'Content-Type': 'application/json' },
              //     body: JSON.stringify(values)
              //   });
              // }
              // const updatedVariant = await response.json();

              // if (!response.ok) {
              //  toast.error(updatedVariant.error || 'Failed to add/update variant');
              //  return;
              // }             
              // console.log('Variant updated successfully:', updatedVariant.variant);
              console.log('Variant form values:', values);

              const variantPayload = {
                color:values.color,
                colorCode:values.colorCode,
                price: values.price,
                stock: values.stock,
                size: values.size,
                image: values.image
              };

              // If variantId exists → update, else → add new
              const result = values.variantId
                ? await dispatch(
                    updateVariant({
                      productId: values.id!,
                      variantId: values.variantId!,
                      variantData: variantPayload
                    })
                  ).unwrap()
                : await dispatch(
                    addVariant({
                      productId: values.id!,
                      variantData: variantPayload
                    })
                  ).unwrap();

              // Success message
              toast.success(
                values.variantId
                  ? 'Variant updated successfully!'
                  : 'Variant added successfully!'
              );

              console.log('Variant result:', result);

              setOpenSingleVariantModal(false);
              setSingleVariantData(undefined);

              dispatch(
                fetchProductsReplace({
                  page: 1,
                  query: searchTerm,
                  sortBy,
                  limit: 12
                })
              );
            } catch (error) {
              console.error('Error updating variant:', error);
              toast.error(
                values.variantId
                  ? 'Failed to update variant'
                  : 'Failed to add variant'
              );
            }
          }}
        />
      )}
      {openVariantDeleteModal && variantToDelete && (
            <RemoveProductModal
              onConfirm={async () => {
                try {
                  // await fetch(
                  //   `/api/products/${variantToDelete.productId}/variants/${variantToDelete.variantId}`,
                  //   { method: 'DELETE' }
                  // );
                  await dispatch(deleteVariant(variantToDelete));
                  toast.success('Variant marked as inactive successfully');
                  dispatch(
                    fetchProductsReplace({
                      page: 1,
                      query: searchTerm,
                      sortBy,
                      limit: 12
                    })
                  );
                } catch (error) {
                  console.error('Failed to delete variant:', error);
                  toast.error('Failed to delete variant');
                } finally {
                  setOpenVariantDeleteModal(false);
                  setVariantToDelete(null);
                }
              }}
              onCancel={() => setOpenVariantDeleteModal(false)}
              title='Remove Variant'
              message={
                <>
                  Are you sure you want to delete this <b>variant</b>?  
                  It will be marked as <span className='text-red-500'>inactive</span>.
                </>
              }
            />
          )}

    </>
  );
};

export default ProductsContent;






// 'use client';

// import React, { useEffect, useState } from 'react';
// import { Table, Input, Spin, Button, Card, Drawer,Space } from 'antd';
// import { ArrowRightOutlined } from '@ant-design/icons';
// import Image from 'next/image';
// import moment from 'moment';
// import { formatPrice } from '@/lib/utils';
// import { toast } from 'react-toastify';

// import { OrderType } from '@/types/order';

// import { useAppDispatch, useAppSelector } from '@/redux/store/hooks';

// import {
//   fetchOrders,
//   setPage,
//   setQuery,
//   clearOrder
// } from '@/redux/store/slices/order-slice';
// import './orders.css';

// import { OrderDetailPage } from '@/app/(user)/orders-detail/OrderDetailPage';

// const OrdersContent: React.FC = () => {
//   const dispatch = useAppDispatch();
//     const { data, total,totalOrders, totalUnits, totalAmount, loadingList, currentPage, query } = useAppSelector(
//       (state) => state.orders
//     );
// const [summary, setSummary] = useState({
//   totalOrders: 0,
//   totalUnits: 0,
//   totalAmount: 0
// });
// const [loadingSummary, setLoadingSummary] = useState(false);

//     const [searchTerm, setSearchTerm] = useState(query || '');
//     const [debouncedTerm, setDebouncedTerm] = useState(query || '');
//     const [openDrawer, setOpenDrawer] = useState(false);
//       const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    
//       const fetchSummary = async () => {
//         setLoadingSummary(true);
//         try {
//           const res = await fetch("http://127.0.0.1:8000/latest-order-summary");
//           const data = await res.json();
//           if (data.status === "Completed") {
//             setSummary({
//               totalOrders: data.totalOrders,
//               totalUnits: data.totalUnits, 
//               totalAmount: data.totalAmount
//             });
//           }
//         } catch (err) {
//           console.error("Failed to fetch summary:", err);
//         } finally {
//           setLoadingSummary(false);
//         }
//       };
//       useEffect(() => {
//         fetchSummary(); 
//         const interval = setInterval(() => {
//           fetchSummary();
//         }, 60000); 

//         return () => clearInterval(interval);
//       }, []);

  
//     useEffect(() => {
//       const timer = setTimeout(() => {
//         setDebouncedTerm(searchTerm);
//         dispatch(setQuery(searchTerm));
//       }, 500);
//       return () => clearTimeout(timer);
//     }, [searchTerm, dispatch]);
  
//     useEffect(() => {
//       dispatch(
//         fetchOrders({ page: currentPage, pageSize: 10, query: debouncedTerm })
//       );
//     }, [dispatch, currentPage, debouncedTerm]);
    
//     const handleMarkCompleted = async (orderId: string) => {
//   try {
//     const res = await fetch(`/api/orders/${orderId}`, {
//       method: 'PATCH'
//     });

//     const data = await res.json();

//     if (res.ok) {
//       toast.success('Order marked as completed');
//      dispatch(
//         fetchOrders({ page: currentPage, pageSize: 10, query: debouncedTerm })
//       );
//     } else {
//       toast.error(data.error || 'Failed to mark order as completed');
//     }
//   } catch (err) {
//     console.error('Error updating order:', err);
//     toast.error('Something went wrong');
//   }
// };

//   const columns = [
//     {
//           title: 'Date',
//           dataIndex: 'date',
//           render: (val: string | Date) => {
//          const dateObj = moment(val);
//         return (
//         <div>
//           <div>{dateObj.format('MM/DD/YYYY')}</div> 
//           <div style={{ fontSize: '0.85em', color: '#555' }}>
//             {dateObj.format('hh:mm:ss A')} 
//           </div>
//         </div>
//       );
//     }
//         },
//     {
//       title: 'Order #',
//       dataIndex: 'orderNo',
//       key: 'orderNo',
//       render: (val: string | number) => <span>{val}</span>
//     },
//     { title: 'User Name', 
//       dataIndex: 'userName', 
//       key: 'userName' 
//     }, 
//     { title: 'Product(s)', 
//       dataIndex: 'products', 
//       key: 'products' 
//     },
//     {
//       title: 'Order Status',
//       dataIndex: 'orderStatus'
//     },
//     {
//       title: 'Amount',
//       dataIndex: 'amount',
//       key: 'amount',
//       render: (amount: number) => <span>{formatPrice(amount)}</span>
//     },
//     {
//     title: 'Actions',
//     key: 'actions',
//     render: (record: OrderType) => (
//       console.log('Order status:', record.orderStatus),
//       <Space>
//         <Button
//           type="text"
//           icon={<ArrowRightOutlined />}
//           onClick={() => {
//             setSelectedOrderId(record.id);
//             setOpenDrawer(true);
//           }}
//         />
//         {(record.orderStatus === 'PAID' || record.orderStatus === 'COMPLETED') && (
//         <Button
//           type="primary"
//           disabled={record.orderStatus === 'COMPLETED'}
//           onClick={() => {
//             if (record.orderStatus === 'PAID') {
//               handleMarkCompleted(record.id);
//             }
//           }}
//           style={{
//             opacity: record.orderStatus === 'COMPLETED' ? 0.6 : 1,
//             cursor: record.orderStatus === 'COMPLETED' ? 'not-allowed' : 'pointer'
//           }}
//         >
//           {record.orderStatus === 'COMPLETED' ? 'Completed' : 'Mark as Complete'}
//         </Button>
//                 )}
//       </Space>
//       )
//      }
//   ];

//   if (loadingList) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <Spin size="large" />
//       </div>
//     );
//   }

//   return (
//     <div className="orders-wrapper">
//       <div className="orders-stats-grid">
//         <Card className="orders-card">
//           <div className='orders-card-inner'>
//             <div className='orders-card-text'>
//               <p className="orders-card-title">Total Orders:</p>
//               <h2 className="orders-card-value">{summary.totalOrders}</h2>
//               {/* <h2 className="orders-card-value">{totalOrders}</h2> */}
//             </div>          
//           <div className='orders-card-icon'>
//             <Image
//               alt='example'
//               src='/total-orders.png'
//               width={48}
//               height={48}
//               className='object-contain'
//               />
//           </div>
//           </div>          
//         </Card>
//         <Card className="orders-card">
//           <div className='orders-card-inner'>
//             <div className='orders-card-text'>
//               <p className="orders-card-title">Total Units:</p>
//               <h2 className="orders-card-value">{summary.totalUnits}</h2>
//               {/* <h2 className="orders-card-value">{totalUnits}</h2> */}
//             </div>          
//           <div className='orders-card-icon'>
//             <Image
//               alt='example'
//               src='/total-units.png'
//               width={48}
//               height={48}
//               className='object-contain'
//               />
//           </div>
//           </div>          
//         </Card>
//         <Card className="orders-card">
//           <div className='orders-card-inner'>
//             <div className='orders-card-text'>
//               <p className="orders-card-title">Total Amount:</p>
//               <h2 className="orders-card-value">{formatPrice(summary.totalAmount)}</h2>
//               {/* <h2 className="orders-card-value">{formatPrice(totalAmount)}</h2> */}
//             </div>         
//           <div className='orders-card-icon'>
//             <Image
//               alt='example'
//               src='/total-amount.png'
//               width={48}
//               height={48}
//               className='object-contain'
//               />
//           </div>
//           </div>          
//         </Card>
//       </div>
//       <div className='orders-header'>
//           <h4 className='orders-header-title'>
//             Orders
//           </h4>
//           <div className='orders-search'>
//             <div
//               className='orders-search-inner'
//             >
//               <Input.Search
//                 placeholder='Search by username & order ID'
//                 className='orders-search-input'
//                 value={searchTerm}       
//                 onChange={(e) => setSearchTerm(e.target.value)}  
//                 onSearch={(value) => setDebouncedTerm(value)}    
//                 allowClear
//               />
//             </div>
//           </div>
//         </div>
//       <Table<OrderType>
//         dataSource={data}
//         columns={columns}
//         rowKey="id"
//         pagination={{
//           current: currentPage,
//           pageSize: 12,
//           total,
//           onChange: (page) => dispatch(setPage(page))
//         }}
//         bordered
//         className="orders-table"
//       />
//       <Drawer
//         title={<h2 className='orders-title'>Order Details</h2>}
//         className="
//             [&_.ant-drawer-content]:bg-[#F9FAFB]
//             [&_.ant-drawer-header]:bg-[#F9FAFB]
//             [&_.ant-drawer-body]:bg-[#F9FAFB]
//             [&_.ant-drawer-body]:p-6
//             [&_.ant-drawer-content]:rounded-l-2xl
//             [&_.ant-drawer-content]:shadow-lg
//           "
//         open={openDrawer}
//         onClose={() => {
//           setOpenDrawer(false);
//         }}
//         afterOpenChange={(open) => {
//         if (!open) dispatch(clearOrder());
//         }}
//         width={1050}
//         destroyOnClose
//       >
//         {selectedOrderId && <OrderDetailPage orderId={selectedOrderId} />}
//       </Drawer>
//     </div>
//   );
// };

// export default OrdersContent;
