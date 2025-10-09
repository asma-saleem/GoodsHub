'use client';

import React, { useEffect, useState } from 'react';
import { Table, Avatar, Space, Spin, Button, Input, Select, Modal } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import SingleVariantEditModal, {
  SingleVariantFormValues
} from '@/components/product-modal/edit-modal';
import Image from 'next/image';

import { ProductType, ProductVariantType } from '@/types/product';
import ProductModal, {
  ProductFormValues
} from '@/components/product-modal/product-modal';
import UploadProductsModal from '@/components/upload-product';
import RemoveProductModal from '@/components/delete-product/delete-product';

import { useAppDispatch, useAppSelector } from '@/redux/store/hooks';
import {
  fetchProductsReplace,
  setSearchAndSort,
  setPage
} from '@/redux/store/slices/product-slice';

import './product.css';

const ProductsContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { products, loading, total, page, searchTerm, sortBy } = useAppSelector(
    (state) => state.products
  );

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

  const [localSearch, setLocalSearch] = useState(searchTerm);
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);

  const [openViewModal, setOpenViewModal] = useState(false);
  const [viewProduct, setViewProduct] = useState<ProductType | null>(null);

  const [openSingleVariantModal, setOpenSingleVariantModal] = useState(false);
  const [singleVariantData, setSingleVariantData] = useState<
    SingleVariantFormValues | undefined
  >(undefined);

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
    console.log('👉 Upload Multiple Products:', files);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    try {
      console.log('Delete Product:', productToDelete.id);
      await fetch(`/api/products/${productToDelete.id}`, {
        method: 'DELETE'
      });
      dispatch(
        fetchProductsReplace({ page: 1, query: searchTerm, sortBy, limit: 12 })
      );
    } catch (err) {
      console.error('Failed to delete product:', err);
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
        const price =
          record.minPrice ?? Math.min(...record.variants.map((v) => v.price));
        return `$${price.toFixed(2)}`;
      }
    },
    {
      title: 'Stock',
      dataIndex: 'variants',
      key: 'stock',
      render: (_: unknown, record: ProductType) => {
        const totalStock = record.variants.reduce((sum, v) => sum + v.stock, 0);
        return totalStock;
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
          {/* <Button
            type='text'
            icon={<EditOutlined />}
            onClick={() => {
              if (record.variants.length === 1) {
                const v = record.variants[0];
                setSingleVariantData({
                  id: record.id,
                  color: v.color || '',
                  size: v.size || '',
                  price: String(v.price ?? ''),
                  stock: String(v.stock ?? ''),
                  image: v.image || ''
                });
                setOpenSingleVariantModal(true); // open directly here
              } else {
                setModalMode('edit');
                setEditData({
                  id: record.id,
                  name: record.title,
                  variants: record.variants.map((v: ProductVariantType) => ({
                    color: v.color || '',
                    size: v.size || '',
                    price: String(v.price ?? ''),
                    stock: String(v.stock ?? ''),
                    image: v.image || ''
                  }))
                });
                setOpenModal(true);
              }
            }} */}
          {/* /> */}

          <Button
            danger
            type='text'
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
      <div className='products-wrapper'>
        {/* Header */}
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

            {/* 🔍 Search + Sort */}
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
                  { value: 'createdAt_desc', label: 'Newest' },
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

      {/* Table */}
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

      {/* Modals */}
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
                  {/* Image */}
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

                  {/* Info */}
                  <div className='flex-1 flex flex-col justify-center text-center md:text-left md:ml-4'>
                    <p className='font-semibold text-gray-800'>
                      {variant.color || '-'}
                    </p>
                    <p className='text-gray-600'>Size: {variant.size || '-'}</p>
                    <p className='text-gray-700 font-bold'>${variant.price}</p>
                    <p className='text-gray-500'>Stock: {variant.stock}</p>
                  </div>

                  {/* Actions */}
                  <div className='flex gap-2 mt-4 md:mt-0'>
                    <Button
                      type='primary'
                      size='small'
                      icon={<EditOutlined />}
                      onClick={() => {
                        setOpenViewModal(false);
                        setSingleVariantData({
                          id: viewProduct.id, // pass productId
                          variantId: variant.id, // pass variantId!
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
                        setProductToDelete(viewProduct);
                        setOpenDeleteModal(true);
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
              console.log(JSON.stringify(values));
              const response = await fetch(`/api/products/${values.id}`, {
                method: 'PUT', // or PATCH depending on your API
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(values)
              });

              if (!response.ok) {
                throw new Error('Failed to update variant');
              }

              const updatedVariant = await response.json();
              console.log('Variant updated successfully:', updatedVariant);

              // Close modal & reset
              setOpenSingleVariantModal(false);
              setSingleVariantData(undefined);

              // Optionally, update local state if you want instant UI update
              // setVariants(prev => prev.map(v => v.id === updatedVariant.id ? updatedVariant : v));
            } catch (error) {
              console.error('Error updating variant:', error);
            }
          }}

        />
      )}
    </>
  );
};

export default ProductsContent;
