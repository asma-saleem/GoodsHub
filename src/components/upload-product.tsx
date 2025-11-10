'use client';

import React, { useState } from 'react';
import { Modal, Upload, Button, Typography } from 'antd';
import {
  UploadOutlined,
  DeleteOutlined,
  FileOutlined
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { toast } from 'react-toastify';

const { Text } = Typography;
const REQUIRED_HEADERS = [
  'title',
  'image',
  'price',
  'color',
  'colorCode',
  'stock',
  'size'
];

interface UploadProductsModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  // eslint-disable-next-line no-unused-vars
  onUpload: (files: UploadFile[]) => void;
}
const downloadSampleCSV = () => {
  const sampleData = `title,image,price,color,colorCode,stock,size
Casual Shirt 9,/dashboard-image-1.png,115,Red,#FF0000,12,S
Casual Shirt 19,/dashboard-image-2.png,125,Blue,#0000FF,12,M
Casual Shirt 9,/dashboard-image-1.png,135,Green,#00FF00,12,L
Casual Shirt 19,/dashboard-image-2.png,600,Yellow,#FFFF00,12,XL
Formal Shirt 8,/dashboard-image-2.png,120,Red,#FF0000,14,S
Formal Shirt 18,/dashboard-image-1.png,130,Blue,#0000FF,14,M
Formal Shirt 8,/dashboard-image-2.png,140,Green,#00FF00,14,L
Formal Shirt 18,/dashboard-image-1.png,150,Yellow,#FFFF00,14,XL`;

  const blob = new Blob([sampleData], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'sample_products.csv';
  a.click();

  window.URL.revokeObjectURL(url);
};

const validateCsvHeaders = async (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        alert('CSV is empty.');
        return resolve(false);
      }

      const firstLine = text.split('\n')[0].trim();
      const headers = firstLine.split(',').map((h) => h.trim());

      const missing = REQUIRED_HEADERS.filter((h) => !headers.includes(h));

      if (missing.length > 0) {
        toast.error(
          'Invalid CSV Format.\nMissing headers:\n' + missing.join(', ')
        );
        resolve(false);
      } else {
        resolve(true);
      }
    };

    reader.readAsText(file);
  });
};

const UploadProductsModal: React.FC<UploadProductsModalProps> = ({
  open,
  setOpen
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleChange = ({
    fileList: newFileList
  }: {
    fileList: UploadFile[];
  }) => {
    setFileList(newFileList);
  };

  const handleUpload = async () => {
    try {
      if (fileList.length === 0) {
        alert('Please select a CSV file first.');
        return;
      }

      const file = fileList[0].originFileObj as File;

      const isValid = await validateCsvHeaders(file);
      if (!isValid) return;

      const fd = new FormData();
      fd.append('file', fileList[0].originFileObj as File);

      const res = await fetch('http://localhost:8000/upload-csv/', {
        method: 'POST',
        body: fd
      });

      if (!res.ok) throw new Error('CSV upload failed');

      const data = await res.json();
      console.log('CSV Upload Started:', data);
      toast.success(data?.message || 'CSV uploaded successfully');

      setFileList([]);
      setOpen(false);
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Something went wrong while uploading the CSV');
    }
  };
  return (
    <Modal
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
      centered
      width={700}
      className="!p-0"
    >
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span
            onClick={() => setOpen(false)}
            className="cursor-pointer text-blue-500"
          >
            &larr;
          </span>
          Add Multiple Products
        </h2>

        <div className="border-b border-gray-200 mb-4" />

        <Upload.Dragger
          fileList={fileList}
          onChange={handleChange}
          disabled={fileList.length >= 1}
          beforeUpload={() => false}
          multiple
          className="!border-gray-300 !rounded-lg"
        >
          <p className="ant-upload-drag-icon flex justify-center">
            <UploadOutlined className="text-3xl text-blue-500" />
          </p>
          <p className="text-gray-600">
            {fileList.length >= 1
              ? 'File uploaded, cannot add more'
              : 'Drop your file here or click to browse'}
          </p>
        </Upload.Dragger>
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-700 mb-2">
            Sample CSV Format
          </h3>
          <p className="text-gray-700 text-sm mb-3">
            Use the following structure for uploading multiple products. Click
            the button below to download a sample CSV file.
          </p>
          <Button type="primary" onClick={downloadSampleCSV}>
            Download Sample CSV
          </Button>
        </div>

        {fileList.length > 0 && (
          <div className="mt-4 bg-gray-50 p-3 rounded-lg border">
            <Text className="block font-medium mb-2">Uploaded Files</Text>
            {fileList.map((file) => (
              <div
                key={file.uid}
                className="flex items-center justify-between py-1"
              >
                <div className="flex items-center gap-2">
                  <FileOutlined className="text-gray-500" />
                  <Text>{file.name}</Text>
                </div>
                <Button
                  type="text"
                  icon={<DeleteOutlined className="text-red-500" />}
                  onClick={() =>
                    setFileList(fileList.filter((f) => f.uid !== file.uid))
                  }
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end mt-6">
          <Button
            type="primary"
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
