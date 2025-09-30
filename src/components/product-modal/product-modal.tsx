'use client';

import React, { useEffect, useState } from 'react';
import { Upload, Input, Button, Form, Modal } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';

import './product-modal.css';

export interface ProductFormValues {
  id:string;
  name: string;
  price: string;
  quantity: string;
  image?: string; 
}

interface ProductModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  mode: 'add' | 'edit';
  initialValues?: ProductFormValues;
  // eslint-disable-next-line no-unused-vars
  onSubmit: (arg0: ProductFormValues) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({
  open,
  setOpen,
  mode,
  initialValues,
  onSubmit
}) => {
  const [form] = Form.useForm<ProductFormValues>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    if (open) {
      form.setFieldsValue(initialValues || { name: '', price: '', quantity: '' });

      if (initialValues?.image) {
        setFileList([
          {
            uid: '-1',
            name: 'product.png',
            status: 'done',
            url: initialValues.image
          }
        ]);
      } else {
        setFileList([]);
      }
    }
  }, [open, initialValues, form]);

const handleFinish = async (values: ProductFormValues) => {
  let imageUrl = initialValues?.image || '/dashboard-image-1.png';

  if (fileList[0]?.originFileObj) {
    const fd = new FormData();
    fd.append('file', fileList[0].originFileObj as File);

    const res = await fetch('/api/products/upload-image', { method: 'POST', body: fd });
    if (!res.ok) throw new Error('Upload failed');

    const { url } = await res.json();  // 👈 ye real URL backend se aayega
    imageUrl = url;
  }

  const payload = { ...values, image: imageUrl };

  if (mode === 'add') {
    await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } else {
    await fetch(`/api/products/${initialValues?.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }

  onSubmit({ ...values, image: imageUrl });
  setOpen(false);
};




  return (
    <Modal
      title={mode === 'add' ? 'Add a Single Product' : 'Edit Product'}
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
      width={700}
    >
      <Form<ProductFormValues>
        layout="vertical"
        form={form}
        onFinish={handleFinish}
        className="product-form"
      >
        {/* Upload Section */}
        <div className="upload-section">
          <Upload
            listType="picture-card"
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            beforeUpload={() => false} // prevent auto upload
          >
            {fileList.length === 0 && (
              <div className="upload-placeholder">
                <UploadOutlined className="upload-icon" />
                <p className="upload-text">Upload</p>
              </div>
            )}
          </Upload>
        </div>

        {/* Right Side Form */}
        <div>
          <Form.Item
            name="name"
            label="Product Name"
            rules={[{ required: true, message: 'Please enter product name' }]}
          >
            <Input placeholder="Enter product name" />
          </Form.Item>

          <div className="price-quantity-grid">
            <Form.Item
              name="price"
              label="Price"
              rules={[{ required: true, message: 'Please enter price' }]}
            >
              <Input placeholder="$00.00" />
            </Form.Item>

            <Form.Item
              name="quantity"
              label="Quantity"
              rules={[{ required: true, message: 'Please enter quantity' }]}
            >
              <Input placeholder="100" />
            </Form.Item>
          </div>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="btn-submit"
            >
              {mode === 'add' ? 'Save' : 'Update'}
            </Button>
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default ProductModal;

