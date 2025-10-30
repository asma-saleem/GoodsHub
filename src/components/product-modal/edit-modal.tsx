'use client';

import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Upload, Select } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';

const { Option } = Select;

import { SingleVariantFormValues } from '@/types/product';

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
    onSubmit({
      ...values,
      colorCode: values.colorCode || colorOptions.find(c => c.name === values.color)?.code || '',
      id: initialValues?.id || values.id,
      variantId: initialValues?.variantId || values.variantId,
      image: imageUrl
    });

    setOpen(false);
    setFileList([]);
  };

  return (
    <Modal
      title={initialValues?.variantId ? 'Edit Variant' : 'Add Variant'}
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
          rules={[{ required: true, message: 'Select color' }]}
        >
          <Select
            placeholder='Select Color'
            onChange={(value) => {
              const color = colorOptions.find((c) => c.name === value);
              form.setFieldValue('colorCode', color?.code || '');
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

        {/* Hidden colorCode field */}
        <Form.Item name='colorCode' hidden>
          <Input type='hidden' />
        </Form.Item>

        {/* ✅ Size dropdown */}
        <Form.Item
          label='Size'
          name='size'
          rules={[{ required: true, message: 'Select size' }]}
        >
          <Select placeholder='Select Size'>
            {['S', 'M', 'L', 'XL'].map((size) => (
              <Option key={size} value={size}>
                {size}
              </Option>
            ))}
          </Select>
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
            beforeUpload={() => false}
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
            {initialValues?.variantId ? 'Update Variant' : 'Add Variant'}
          </Button>

        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SingleVariantEditModal;
