'use client';

import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Upload, Select } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';

const { Option } = Select;

import { SingleVariantFormValues } from '@/types/product';
import { toast } from 'react-toastify';

interface SingleVariantEditModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  mode: 'add' | 'edit';
  initialValues?: SingleVariantFormValues;
  // eslint-disable-next-line no-unused-vars
  onSubmit: (values: SingleVariantFormValues) => void;
  submitting?: boolean;
}

const SingleVariantEditModal: React.FC<SingleVariantEditModalProps> = ({
  open,
  setOpen,
  mode,
  initialValues,
  onSubmit,
  submitting = false
}) => {
  const [form] = Form.useForm<SingleVariantFormValues>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [localSubmitting, setLocalSubmitting] = useState(false);

  const colorOptions = React.useMemo(
  () => [
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
  ],
  []
);
  useEffect(() => {
  if (!open) return;

  if (mode === 'edit' && initialValues) {
    form.setFieldsValue(initialValues);
    if (initialValues.image) {
      setFileList([{
        uid: '-1',
        name: 'variant.png',
        status: 'done',
        url: initialValues.image
      }]);
    } else {
      setFileList([]);
    }
  } else if (mode === 'add') {
    form.resetFields();
    setFileList([]);
  }
}, [open, mode, initialValues, form]);

  const colorValue = Form.useWatch('color', form);

useEffect(() => {
  if (colorValue) {
    const color = colorOptions.find((c) => c.name === colorValue);
    if (color) {
      form.setFieldsValue({ colorCode: color.code });
    } else {
      form.setFieldsValue({ colorCode: '' });
    }
  }
}, [colorValue, colorOptions, form]);

  const handleFinish = async (values: SingleVariantFormValues) => {
  if (localSubmitting) return;
  setLocalSubmitting(true);
  try {
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

      const updatedData: SingleVariantFormValues = {
        ...values,
        colorCode:
          values.colorCode ||
          colorOptions.find(c => c.name === values.color)?.code ||
          '',
        id: initialValues?.id || values.id,
        variantId: initialValues?.variantId || values.variantId,
        image: imageUrl
      };

      const hasChanges = Object.keys(updatedData).some(
        key =>
          updatedData[key as keyof SingleVariantFormValues] !==
          initialValues?.[key as keyof SingleVariantFormValues]
      );

      if (!hasChanges) {
        toast.error('No changes detected. Nothing to update.');
        setOpen(false);
        return;
      }
      await onSubmit(updatedData);
      setOpen(true);
    }catch (error) {
    toast.error(String(error) || 'Failed to save variant. Please try again.');
  } finally {
    setLocalSubmitting(false);
  }
};


  return (
    <Modal
      title={mode === 'edit' ? 'Edit Variant' : 'Add Variant'} 
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
      width={600}
    >
      <Form layout='vertical' form={form} onFinish={handleFinish}>
        <Form.Item
          label='Color'
          name='color'
          rules={[{ required: true, message: 'Select color' }]}
        >
          <Select
            placeholder='Select Color'

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
                    marginRight: 8
                  }}
                />
                {c.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name='colorCode' hidden>
          <Input type='hidden' />
        </Form.Item>

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
          rules={[
            { required: true, message: 'Enter price' },
            {
              validator(_, value) {
                if (!value) return Promise.resolve();
                if (Number(value) <= 0) return Promise.reject('Price must be greater than 0');
                if (Number(value) > 1000000)
                  return Promise.reject('Price cannot exceed 1,000,000');
                return Promise.resolve();
              }
            }
          ]}
        >
          <Input type='number' placeholder='1200' />
        </Form.Item>

        <Form.Item
          label='Stock'
          name='stock'
          rules={[
            { required: true, message: 'Enter stock' },
            {
              validator(_, value) {
                if (!value) return Promise.resolve();
                if (Number(value) < 0)
                  return Promise.reject('Stock must be greater or equal to 0');
                if (Number(value) > 1000000)
                  return Promise.reject('Stock cannot exceed 1,000,000');
                return Promise.resolve();
              }
            }
          ]}
        >
          <Input type='number' placeholder='10' />
        </Form.Item>

        <Form.Item
          label='Image'
          name='image'
          rules={[{ required: true, message: 'Upload an image' }]}
        >
          <Upload
            listType="picture-card"
            beforeUpload={() => false}
            fileList={fileList}
            onChange={({ fileList: newList }) => {
            setFileList(newList);

            if (newList.length === 0) {
              setTimeout(() => {
                form.setFieldValue('image', undefined);
              }, 0);
            }
          }}

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
          <Button type='primary' htmlType='submit' block loading={submitting || localSubmitting} disabled={submitting || localSubmitting}>
            {mode === 'edit' ? 'Update Variant' : 'Add Variant'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SingleVariantEditModal;
