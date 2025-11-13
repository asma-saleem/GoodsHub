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

interface CsvRow {
  title: string;
  image: string;
  price: string;
  color: string;
  colorCode: string;
  stock: string;
  size: string;
}

interface UploadProductsModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  // eslint-disable-next-line no-unused-vars
  onUpload: (files: UploadFile[]) => void;
}
const downloadSampleCSV = () => {
  const sampleData = `title,image,price,color,colorCode,stock,size
  Casual Shirt 9,/dashboard-image-1.png,115,Red,#FF0000,12,S`;

  const blob = new Blob([sampleData], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'sample_products.csv';
  a.click();

  window.URL.revokeObjectURL(url);
};

const validateCsv = async (file: File): Promise<string[]> => {
  return new Promise((resolve) => {
    const errors: string[] = [];
    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      const result = e.target?.result;
      if (!result || typeof result !== 'string') {
        errors.push('CSV is empty or could not be read as text.');
        return resolve(errors);
      }

      const lines: string[] = result
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0);

      if (lines.length === 0) {
        errors.push('CSV has no content.');
        return resolve(errors);
      }

      const headers: string[] = lines[0]
        .split(',')
        .map((h: string) => h.trim());

      const missing = REQUIRED_HEADERS.filter((h) => !headers.includes(h));
      if (missing.length > 0) {
        errors.push(`Missing headers: ${missing.join(', ')}`);
      }

      for (let i = 1; i < lines.length; i++) {
        const cols: string[] = lines[i].split(',').map((c: string) => c.trim());
        if (cols.length < headers.length) {
          errors.push(`Row ${i}: Not enough columns`);
          continue;
        }

        const row: CsvRow = {
          title: cols[headers.indexOf('title')],
          image: cols[headers.indexOf('image')],
          price: cols[headers.indexOf('price')],
          color: cols[headers.indexOf('color')],
          colorCode: cols[headers.indexOf('colorCode')],
          stock: cols[headers.indexOf('stock')],
          size: cols[headers.indexOf('size')]
        };

        if (!row.title) errors.push(`Row ${i}: title is required`);

        if (!row.image || !/\.(png|jpeg|jpg)$/i.test(row.image)) {
          errors.push(`Row ${i}: image must be png/jpeg/jpg`);
        }

        const price = Number(row.price);
        if (isNaN(price) || price <= 0) errors.push(`Row ${i}: price must be > 0`);

        const stock = Number(row.stock);
        if (isNaN(stock) || stock < 0) errors.push(`Row ${i}: stock must be >= 0`);

        if (!/^#[0-9A-Fa-f]{6}$/.test(row.colorCode)) {
          errors.push(`Row ${i}: colorCode must be in #RRGGBB format`);
        }

        if (!row.color) errors.push(`Row ${i}: color is required`);
        if (!row.size) {
          errors.push(`Row ${i}: size is required`);
        } else if (!isNaN(Number(row.size)) && Number(row.size) <= 0) {
          errors.push(`Row ${i}: size cannot be zero or negative`);
        }

      }

      resolve(errors);
    };

    reader.readAsText(file);
  });
};


const UploadProductsModal: React.FC<UploadProductsModalProps> = ({
  open,
  setOpen
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

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

      const errors = await validateCsv(file);

    if (errors.length > 0) {
      setValidationErrors(errors);
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
          accept=".csv"
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

        {validationErrors.length > 0 && (
          <div className="mt-4 p-4 border border-red-300 bg-red-50 rounded-lg max-h-60 overflow-y-auto">
            <Text className="font-medium text-red-700 mb-2 block">
              CSV Validation Errors ({validationErrors.length}):
            </Text>
            <ul className="list-disc list-inside text-sm text-red-600">
              {validationErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
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
