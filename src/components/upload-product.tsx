'use client';

import React, { useState } from 'react';
import { Modal, Upload, Button, Typography } from 'antd';
import { UploadOutlined, DeleteOutlined, FileOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';

const { Text } = Typography;

interface UploadProductsModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  // eslint-disable-next-line no-unused-vars
  onUpload: (files: UploadFile[]) => void;
}

const UploadProductsModal: React.FC<UploadProductsModalProps> = ({ open, setOpen }) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    setFileList(newFileList);
  };

const handleUpload = async () => {
  try {
    if (fileList.length === 0) {
      alert('Please select a CSV file first.');
      return;
    }

    const fd = new FormData();
    fd.append('file', fileList[0].originFileObj as File);

    const res = await fetch('http://localhost:8000/upload-csv/', {
      method: 'POST',
      body: fd
    });

    if (!res.ok) throw new Error('CSV upload failed');

    const data = await res.json();
    console.log('CSV Upload Started:', data);

    setFileList([]);
    setOpen(false);
  } catch (err) {
    console.error('Upload error:', err);
  }
};
  return (
    <Modal
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
      centered
      width={700}
      className='!p-0'
    >
      <div className='p-6'>
        <h2 className='text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2'>
          <span
            onClick={() => setOpen(false)}
            className='cursor-pointer text-blue-500'
          >
            &larr;
          </span>
          Add Multiple Products
        </h2>

        <div className='border-b border-gray-200 mb-4' />

        <Upload.Dragger
          fileList={fileList}
          onChange={handleChange}
          beforeUpload={() => false}
          multiple
          className='!border-gray-300 !rounded-lg'
        >
          <p className='ant-upload-drag-icon flex justify-center'>
            <UploadOutlined className='text-3xl text-blue-500' />
          </p>
          <p className='text-gray-600'>Drop your file here to upload</p>
          <Button className='mt-2' type='link'>
            Browse
          </Button>
        </Upload.Dragger>

        {fileList.length > 0 && (
          <div className='mt-4 bg-gray-50 p-3 rounded-lg border'>
            <Text className='block font-medium mb-2'>Uploaded Files</Text>
            {fileList.map((file) => (
              <div
                key={file.uid}
                className='flex items-center justify-between py-1'
              >
                <div className='flex items-center gap-2'>
                  <FileOutlined className='text-gray-500' />
                  <Text>{file.name}</Text>
                </div>
                <Button
                  type='text'
                  icon={<DeleteOutlined className='text-red-500' />}
                  onClick={() =>
                    setFileList(fileList.filter((f) => f.uid !== file.uid))
                  }
                />
              </div>
            ))}
          </div>
        )}

        <div className='flex justify-end mt-6'>
          <Button
            type='primary'
            onClick={handleUpload}
            disabled={fileList.length === 0}
          >
            Upload File
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default UploadProductsModal;
