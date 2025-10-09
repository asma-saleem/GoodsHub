'use client';

import React, { useEffect } from 'react';
import { Upload, Input, Button, Form, Modal, Divider } from 'antd';
import { UploadOutlined, PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import './product-modal.css';

export interface ProductVariant {
  color?: string;
  size?: string;
  price: string;
  stock: string;
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
  const [form] = Form.useForm<ProductFormValues>();

  // 🟢 Prefill data when editing
  // 🟢 Prefill data when editing
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
        variants: [{ color: '', size: '', price: '', stock: '', image: [] }]
      });
    }
  }
}, [open, initialValues, mode, form]);



  const handleFinish = async (values: ProductFormValues) => {
  if (mode === 'edit') {
    // Only update product title; variants stay the same
    const payload: ProductFormValues = {
      ...initialValues,          // keep existing variants
      name: values.name,         // update title only
      variants: initialValues?.variants || []
    };

    await fetch(`/api/products/${initialValues?.id ?? ''}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    onSubmit(payload);
    setOpen(false);
    return; // exit early for edit mode
  }

  // 🟣 Add mode logic: upload images and map variants
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

  await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  onSubmit(payload);
  setOpen(false);
};


  return (
    <Modal
      title={mode === 'add' ? 'Add Product' : 'Edit Product'}
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
      width={850}
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

        <Divider orientation='left'>Product Variants</Divider>

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
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: '16px'
                    }}
                  >
                    <Form.Item
                      {...rest}
                      name={[name, 'color']}
                      label='Color'
                      rules={[{ required: true, message: 'Enter color' }]}
                    >
                      <Input placeholder='e.g. Red' />
                    </Form.Item>

                    <Form.Item
                      {...rest}
                      name={[name, 'size']}
                      label='Size'
                      rules={[{ required: true, message: 'Enter size' }]}
                    >
                      <Input placeholder='e.g. M' />
                    </Form.Item>

                    <Form.Item
                      {...rest}
                      name={[name, 'price']}
                      label='Price'
                      rules={[{ required: true, message: 'Enter price' }]}
                    >
                      <Input placeholder='e.g. 1200' type='number' />
                    </Form.Item>

                    <Form.Item
                      {...rest}
                      name={[name, 'stock']}
                      label='Stock'
                      rules={[{ required: true, message: 'Enter stock' }]}
                    >
                      <Input placeholder='10' type='number' />
                    </Form.Item>

                    <Form.Item
                      {...rest}
                      name={[name, 'image']}
                      label='Image'
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
                      >
                        <div className='upload-btn-wrapper'>
                          <UploadOutlined className='upload-icon' />
                          <p className='upload-text'>Upload</p>
                        </div>
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
                  onClick={() => add()}
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
          <Button type='primary' htmlType='submit' className='btn-submit' block>
            {mode === 'add' ? 'Save Product' : 'Update Product'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProductModal;