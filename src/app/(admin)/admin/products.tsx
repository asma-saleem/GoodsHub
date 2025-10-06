'use client';

import React, { useEffect, useState } from 'react';
import { Table, Avatar, Space, Spin, Button, Input, Select } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';

import { ProductType } from '@/types/product';
import ProductModal, {
  ProductFormValues
} from '@/components/product-modal/product-modal';
import UploadProductsModal from '@/components/upload-product';
import RemoveProductModal from '@/components/delete-product/delete-product';

import { useAppDispatch, useAppSelector } from '@/redux/store/hooks';
import {
  fetchProducts,
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

  // Debounce effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(localSearch);
    }, 700);

    return () => {
      clearTimeout(handler);
    };
  }, [localSearch]);

  // Run dispatch when debouncedTerm changes
  useEffect(() => {
    dispatch(setSearchAndSort({ searchTerm: debouncedTerm, sortBy }));
  }, [debouncedTerm, sortBy, dispatch]);

  useEffect(() => {
    dispatch(fetchProducts({ page, query: searchTerm, sortBy, limit: 12 }));
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
        fetchProducts({ page: 1, query: searchTerm, sortBy, limit: 12 })
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
                id: record.id,
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
    </>
  );
};

export default ProductsContent;
