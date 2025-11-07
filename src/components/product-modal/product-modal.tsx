'use client';

import React, { useEffect, useState } from 'react';
import { Upload, Input, Button, Form, Modal } from 'antd';
import {
  UploadOutlined,
  PlusOutlined,
  MinusCircleOutlined
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { Select } from 'antd';
const { Option } = Select;
import './product-modal.css';
import { addProduct, updateProduct } from '@/redux/store/slices/product-slice';
import { useAppDispatch } from '@/redux/store/hooks';
import { toast } from 'react-toastify';

export interface ProductVariant {
  color?: string;
  colorCode?: string;
  size?: string;
  price: number;
  stock: number;
  image?: string | UploadFile[];
}

export interface ProductFormValues {
  id?: string;
  name: string;
  variants: ProductVariant[];
}

interface ProductModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  mode: 'add' | 'edit';
  initialValues?: ProductFormValues;
  // eslint-disable-next-line no-unused-vars
  onSubmit: (values: ProductFormValues) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({
  open,
  setOpen,
  mode,
  initialValues,
  onSubmit
}) => {
  const dispatch = useAppDispatch();
  const [submitting, setSubmitting] = useState(false); 
  const [form] = Form.useForm<ProductFormValues>();
  const colorOptions = [
    { name: 'Black', code: '#000000' },
    { name: 'White', code: '#FFFFFF' },
    { name: 'Gray', code: '#808080' },
    { name: 'Navy', code: '#000080' },
    { name: 'Blue', code: '#0000FF' },
    { name: 'Red', code: '#FF0000' },
    { name: 'Green', code: '#008000' },
    { name: 'Brown', code: '#8B4513' },
    { name: 'Beige', code: '#F5F5DC' },
    { name: 'Pink', code: '#FFC0CB' }
  ];
  useEffect(() => {
    if (open) {
      if (initialValues) {
        if (mode === 'edit') {
          // Only prefill title in edit mode
          form.setFieldsValue({ name: initialValues.name });
        } else {
          // Prefill title and variants in add mode
          const variantsWithFiles = initialValues.variants.map((v) => ({
            ...v,
            image: v.image
              ? [
                  {
                    uid: `${Math.random()}`,
                    name: 'variant-image.png',
                    status: 'done',
                    url:
                      typeof v.image === 'string'
                        ? v.image
                        : v.image?.[0]?.url || ''
                  } as UploadFile
                ]
              : []
          }));
          form.setFieldsValue({
            name: initialValues.name,
            variants: variantsWithFiles
          });
        }
      } else {
        form.setFieldsValue({
          name: '',
          variants: [
            {
              color: undefined,
              size: undefined,
              price: 0,
              stock: 0,
              image: []
            }
          ]
        });
      }
    }
  }, [open, initialValues, mode, form]);

  const handleFinish = async (values: ProductFormValues) => {
    setSubmitting(true);
    if (mode === 'edit') {
      if (!initialValues?.id) {
        toast.error('Product ID is missing!');
        return;
      }
      const payload = {
        id: initialValues?.id,
        name: values.name
      };

      // await fetch(`/api/products/${initialValues?.id ?? ''}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload)
      // });

      // onSubmit(payload as ProductFormValues);
      // setOpen(false);
      try {
      const updatedProduct =  await dispatch(updateProduct(payload)).unwrap();
      toast.success('Product name updated successfully!');
      onSubmit(updatedProduct);
      setOpen(false);
    } catch (error) {
      toast.error(String(error) || 'Failed to update product name');
    }
    finally {
      setSubmitting(false); // enable button after submission
    }
      return;
    }
    if (!values.variants || values.variants.length < 1) {
    toast.error('At least one variant is required.');
    return;
  }
    const variants = await Promise.all(
      values.variants.map(async (variant) => {
        let imageUrl = '';

        const fileList = variant.image as UploadFile[] | undefined;
        const fileObj = fileList && fileList[0]?.originFileObj;

        if (fileObj) {
          const fd = new FormData();
          fd.append('file', fileObj as File);

          const res = await fetch('/api/products/upload-image', {
            method: 'POST',
            body: fd
          });
          if (!res.ok) throw new Error('Image upload failed');
          const { url } = await res.json();
          imageUrl = url;
        } else if (fileList && fileList[0]?.url) {
          imageUrl = fileList[0].url;
        }

        return {
          color: variant.color,
          colorCode: variant.colorCode,
          size: variant.size,
          price: variant.price,
          stock: variant.stock,
          image: imageUrl
        };
      })
    );

    const payload: ProductFormValues = {
      ...values,
      variants
    };

    try {
      await dispatch(addProduct(payload)).unwrap();
      toast.success('Product added successfully!');
      onSubmit(payload);
      setOpen(false);
    } catch (error) {
      console.error('Add product failed:', error);
      toast.error(String(error) || 'Failed to create product');
    }

  };

  return (
    <Modal
      title={mode === 'add' ? 'Add Product' : 'Edit Product'}
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
      width={500}
      className='product-modal'
      styles={{
        body: {
          maxHeight: '70vh',
          overflowY: 'auto',
          paddingRight: 16
        }
      }}
    >
      <Form<ProductFormValues>
        layout='vertical'
        form={form}
        onFinish={handleFinish}
        initialValues={{
          name: initialValues?.name || '',
          variants: initialValues?.variants?.length
            ? initialValues.variants.map((v) => ({
                color: v.color || colorOptions[0].name,
                size: v.size || 'S',
                price: v.price,
                stock: v.stock,
                image: v.image || []
              }))
            : [
                {
                  color: colorOptions[0].name,
                  size: 'S',
                  price: '',
                  stock: '',
                  image: []
                }
              ]
        }}
        className='product-form'
      >
        <Form.Item
          name='name'
          label='Product Name'
          rules={[{ required: true, message: 'Please enter product name' }]}
        >
          <Input placeholder="e.g. Men's Casual Shirt" />
        </Form.Item>

        {mode === 'add' && (
          <>
            <Form.List name='variants'>
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...rest }) => (
                    <div
                      key={key}
                      className='variant-item'
                      style={{
                        border: '1px solid #f0f0f0',
                        padding: '16px',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        background: '#fafafa'
                      }}
                    >
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns:
                            'repeat(auto-fit, minmax(150px, 1fr))',
                          gap: '16px'
                        }}
                      >
                        <Form.Item
                          {...rest}
                          name={[name, 'color']}
                          label='Color'
                          rules={[
                            { required: true, message: 'Select a color' }
                          ]}
                        >
                          <Select
                            placeholder='Select Color'
                            style={{ width: '100%' }}
                            onChange={(value: string) => {
                              const color = colorOptions.find(
                                (c) => c.name === value
                              );
                              const currentVariants =
                                form.getFieldValue('variants');
                              currentVariants[name] = {
                                ...currentVariants[name],
                                colorCode: color?.code
                              };
                              form.setFieldsValue({
                                variants: currentVariants
                              });
                            }}
                          >
                            {colorOptions.map((c) => (
                              <Option key={c.name} value={c.name}>
                                <span
                                  style={{
                                    display: 'inline-block',
                                    width: 16,
                                    height: 16,
                                    backgroundColor: c.code,
                                    borderRadius: '50%',
                                    marginRight: 8,
                                    verticalAlign: 'middle'
                                  }}
                                />
                                {c.name}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>

                        <Form.Item
                          {...rest}
                          name={[name, 'size']}
                          label='Size'
                          rules={[{ required: true, message: 'Select a size' }]}
                        >
                          <Select
                            placeholder='Select Size'
                            style={{ width: '100%' }}
                          >
                            {['S', 'M', 'L', 'XL'].map((size) => (
                              <Option key={size} value={size}>
                                {size}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>

                        <Form.Item
                          {...rest}
                          name={[name, 'price']}
                          label='Price'
                          rules={[{ required: true, message: 'Enter price' },
                            {
                              validator(_, value) {
                                if (value === undefined || value === null || value === '') {
                                    return Promise.resolve();
                                  }
                                // if (value === undefined || value === null || value === '') {
                                //   return Promise.reject('Enter price');
                                // }
                                if (Number(value) <= 0) {
                                  return Promise.reject('Price must be greater than 0');
                                }
                                if (Number(value) > 1000000) {
                                  return Promise.reject('Price cannot exceed 1,000,000');
                                }
                                return Promise.resolve();
                              }
                            }
                          ]}
                        >
                          <Input placeholder='e.g. 1200' type='number' />
                        </Form.Item>

                        <Form.Item
                          {...rest}
                          name={[name, 'stock']}
                          label='Stock'
                          rules={[{ required: true, message: 'Enter stock' },
                            {
                              validator(_, value) {
                                if (value === undefined || value === null || value === '') {
                                    return Promise.resolve();
                                  }
                                // if (value === undefined || value === null || value === '') {
                                //   return Promise.reject('Enter price');
                                // }
                                if (Number(value) < 0) {
                                  return Promise.reject('Stock must be greater or equal to 0');
                                }
                                if (Number(value) > 1000000) {
                                  return Promise.reject('Stock cannot exceed 1,000,000');
                                }
                                return Promise.resolve();
                              }
                            }
                          ]}
                        >
                          <Input placeholder='10' type='number' />
                        </Form.Item>

                        <Form.Item
                          {...rest}
                          name={[name, 'image']}
                          label='Image'
                          rules={[{ required: true, message: 'Upload an image' }]}
                          valuePropName='fileList'
                          getValueFromEvent={(e) =>
                            Array.isArray(e) ? e : e?.fileList
                          }
                          className='variant-upload-item'
                        >
                          <Upload
                            listType='picture-card'
                            beforeUpload={() => false}
                            multiple={false}
                            maxCount={1}
                            className='variant-upload'
                            onChange={() => {
                              form.setFieldsValue({
                                variants: [...form.getFieldValue('variants')]
                              });
                            }}
                          >
                            {!(
                              form.getFieldValue(['variants', name, 'image']) ||
                              []
                            ).length && (
                              <div className='upload-btn-wrapper'>
                                <UploadOutlined className='upload-icon' />
                                <p className='upload-text'>Upload</p>
                              </div>
                            )}
                          </Upload>
                        </Form.Item>
                      </div>

                      <div className='flex justify-end mt-2'>
                        <Button
                          danger
                          type='link'
                          icon={<MinusCircleOutlined />}
                          onClick={() => remove(name)}
                        >
                          Remove Variant
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Form.Item>
                    <Button
                      type='dashed'
                      onClick={() =>
                        add({
                          color: undefined,
                          size: undefined,
                          price: '',
                          stock: '',
                          image: []
                        })
                      }
                      icon={<PlusOutlined />}
                      block
                    >
                      Add Variant
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </>
        )}

        <Form.Item>
          <Button type='primary' htmlType='submit' className='btn-submit' block loading={submitting} // shows spinner
          disabled={submitting}> 
            {mode === 'add' ? 'Save Product' : 'Update Product'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProductModal;
