'use client';

import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';

export interface SingleVariantFormValues {
  id?: string;
  variantId?: string;
  color: string;
  size: string;
  price: string;
  stock: string;
  image?: string; // store uploaded image URL
}

interface SingleVariantEditModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  initialValues?: SingleVariantFormValues;
    // eslint-disable-next-line no-unused-vars
  onSubmit: (values: SingleVariantFormValues) => void;
}

const SingleVariantEditModal: React.FC<SingleVariantEditModalProps> = ({
  open,
  setOpen,
  initialValues,
  onSubmit
}) => {
  const [form] = Form.useForm<SingleVariantFormValues>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    if (open && initialValues) {
      form.setFieldsValue(initialValues);

      if (initialValues.image) {
        setFileList([
          {
            uid: '-1',
            name: 'variant.png',
            status: 'done',
            url: initialValues.image
          }
        ]);
      } else {
        setFileList([]);
      }
    }
  }, [open, initialValues, form]);

  const handleFinish = async (values: SingleVariantFormValues) => {
    let imageUrl = initialValues?.image || '';

    // upload new image if selected
    if (fileList[0]?.originFileObj) {
      const fd = new FormData();
      fd.append('file', fileList[0].originFileObj as File);

      const res = await fetch('/api/products/upload-image', {
        method: 'POST',
        body: fd
      });
      if (!res.ok) throw new Error('Upload failed');
      const { url } = await res.json();
      imageUrl = url;
    } else if (fileList[0]?.url) {
      imageUrl = fileList[0].url;
    }
    onSubmit({ ...values,variantId: initialValues?.variantId || values.variantId, image: imageUrl });
    setOpen(false);
    setFileList([]);
  };

  return (
    <Modal
      title='Edit Product Variant'
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
      width={600}
    >
      <Form
        layout='vertical'
        form={form}
        onFinish={handleFinish}
        initialValues={initialValues}
      >

        <Form.Item
          label='Color'
          name='color'
          rules={[{ required: true, message: 'Enter color' }]}
        >
          <Input placeholder='e.g. Red' />
        </Form.Item>

        <Form.Item
          label='Size'
          name='size'
          rules={[{ required: true, message: 'Enter size' }]}
        >
          <Input placeholder='e.g. M' />
        </Form.Item>

        <Form.Item
          label='Price'
          name='price'
          rules={[{ required: true, message: 'Enter price' }]}
        >
          <Input type='number' placeholder='1200' />
        </Form.Item>

        <Form.Item
          label='Stock'
          name='stock'
          rules={[{ required: true, message: 'Enter stock' }]}
        >
          <Input type='number' placeholder='10' />
        </Form.Item>

        <Form.Item label='Image'>
          <Upload
            listType='picture-card'
            beforeUpload={() => false} // prevent auto upload
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            maxCount={1}
          >
            {fileList.length === 0 && (
              <div>
                <UploadOutlined />
                <p>Upload</p>
              </div>
            )}
          </Upload>
        </Form.Item>

        <Form.Item>
          <Button type='primary' htmlType='submit' block>
            Update Variant
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SingleVariantEditModal;
