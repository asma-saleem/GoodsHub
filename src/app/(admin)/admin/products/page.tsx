'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

import {
  Table,
  Avatar,
  Space,
  Spin,
  Button,
  Input,
  Select,
  Modal,
  Tooltip,
  Tag
} from 'antd';
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
  deleteProduct,
  reactivateVariant
} from '@/redux/store/slices/product-slice';
import { toast } from 'react-toastify';

import './products.css';

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

  const [inactiveVariantData, setInactiveVariantData] = useState<
  (ProductVariantType & { message?: string }) | null
  >(null);

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
                  <Tag key={i} color='grey' style={{ margin: 0 }}>
                    ${price.toFixed(2)}
                  </Tag>
                ))}
              </div>
            }
            placement='bottom'
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
            placement='bottom'
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
                  <Tag key={i} color='grey' style={{ margin: 0 }}>
                    {size}
                  </Tag>
                ))}
              </div>
            }
            placement='bottom'
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
            className='single-variant-button'
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
                  // { value: 'price_asc', label: 'Price: Low to High' },
                  // { value: 'price_desc', label: 'Price: High to Low' },
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
            showSizeChanger: false,
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
            className='view-modal-container'
            style={{ maxHeight: '70vh', overflowY: 'auto', padding: '20px' }}
          >
            {viewProduct.variants.map(
              (variant: ProductVariantType, idx: number) => (
                <div
                  key={idx}
                  className='variant-container'
                >
                  <div className='variant-image-wrapper'>
                    {variant.image ? (
                      <Image
                        src={variant.image}
                        alt={variant.color || 'product image'}
                        fill
                        className='object-cover rounded'
                      />
                    ) : (
                      <div className='variant-fallback-image' />
                    )}
                  </div>

                  <div className='variant-details'>
                    <p className='variant-color-text'>
                      {variant.color || '-'}
                    </p>
                    {variant.colorCode && (
                      <span
                        className='variant-color-code'
                        style={{ backgroundColor: variant.colorCode }}
                        title={variant.colorCode}
                      />
                    )}
                    <p className='variant-size-text'>Size: {variant.size || '-'}</p>
                    <p className='variant-price-text'>${variant.price}</p>
                    <p className='variant-stock-text'>Stock: {variant.stock}</p>
                  </div>
                  <div className='variant-button-wrapper'>
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
              console.log('Variant form values:', values);

              const variantPayload = {
                color: values.color,
                colorCode: values.colorCode,
                price: values.price,
                stock: values.stock,
                size: values.size,
                image: values.image
              };
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
              console.log('Variant submission error:', error);
              if (
                typeof error === 'object' &&
                error !== null &&
                'type' in error &&
                (error as { type: string }).type === 'INACTIVE_VARIANT'
              ) {
                const payload = error as {
                  type: string;
                  variant: ProductVariantType;
                  message: string;
                };

                setInactiveVariantData({
                  ...payload.variant,
                  message: payload.message
                });

                return; 
              }
              let message = values.variantId ? 'Failed to update variant' : 'Failed to add variant';

              if (typeof error === 'object' && error !== null && 'payload' in error) {
                message = String(error.payload) || message;
              } else if (error instanceof Error) {
                message = error.message;
              } else if (typeof error === 'string') {
                message = error;
              }
              toast.error(message);
            }
          }}
        />
      )}
      {openVariantDeleteModal && variantToDelete && (
        <RemoveProductModal
          onConfirm={async () => {
            try {
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
              Are you sure you want to delete this <b>variant</b>? It will be
              marked as <span className='text-red-500'>inactive</span>.
            </>
          }
        />
      )}
      {inactiveVariantData && (
        <Modal
          open={!!inactiveVariantData}
          title={
            <div className="inactive-variant-title">
              Inactive Variant Found
            </div>
          } // custom title handle below
          onCancel={() => setInactiveVariantData(null)}
          footer={[
            <Button key="cancel" onClick={() => setInactiveVariantData(null)}>
              Cancel
            </Button>,
            <Button
              key="activate"
              type="primary"
              className="reactivate-btn"
              onClick={async () => {
                try {
                  await dispatch(
                    reactivateVariant({
                      productId: inactiveVariantData.productId,
                      variantId: inactiveVariantData.id
                    })
                  ).unwrap();

                  toast.success('Variant reactivated successfully');
                  setInactiveVariantData(null);
                  dispatch(fetchProductsReplace({ page: 1, query: searchTerm, sortBy, limit: 12 }));
                } catch (error) {
                  console.error('Failed to reactivate variant:', error);
                  toast.error('Failed to reactivate variant');
                }
              }}
            >
              Reactivate
            </Button>
          ]}
        >
          <div className="inactive-modal">
            {/* <h2 className="inactive-modal-title">{inactiveVariantData.product?.title}</h2> */}
            <p className="inactive-modal-message">{inactiveVariantData.message}</p>

            <div className="inactive-modal-content">
              <div className="inactive-image">
                {inactiveVariantData.image ? (
                  <Image
                    src={inactiveVariantData.image}
                    alt={inactiveVariantData.color || inactiveVariantData.product?.title || 'Product Image'}
                    width={28}
                    height={28}
                    className="inactive-product-image"
                  />
                ) : (
                  <div className="inactive-fallback">No Image</div>
                )}
              </div>

              <div className="inactive-details">
                <div><b>Color:</b> {inactiveVariantData.color}</div>
                <div className="flex items-center gap-2">
                  <b>Color Code:</b>{' '}
                  <span
                    className="inline-block w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: inactiveVariantData.colorCode }}
                  ></span>
                </div>
                <div><b>Size:</b> {inactiveVariantData.size}</div>
                <div><b>Price:</b> ${inactiveVariantData.price}</div>
                <div><b>Stock:</b> {inactiveVariantData.stock}</div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default ProductsContent;

