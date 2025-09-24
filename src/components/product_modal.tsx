
// 'use client';

// import React from 'react';
// import { Upload, Input, Button, Form, Modal } from 'antd';
// import { UploadOutlined } from '@ant-design/icons';

// interface ProductFormValues {
//   name: string;
//   price: string;
//   quantity: string;
// }

// interface AddProductModalProps {
//   open: boolean;
//   setOpen: React.Dispatch<React.SetStateAction<boolean>>;
// }

// const AddProductModal: React.FC<AddProductModalProps> = ({ open, setOpen }) => {
//   const [form] = Form.useForm<ProductFormValues>();

//   const handleFinish = (values: ProductFormValues) => {
//     console.log('Form Values:', values);
//     setOpen(false);
//   };

//   return (
//     <Modal
//       title="Add a Single Product"
//       open={open}
//       onCancel={() => setOpen(false)}
//       footer={null}
//       width={700}
//     >
//       <Form<ProductFormValues>
//         layout="vertical"
//         form={form}
//         onFinish={handleFinish}
//         className="grid grid-cols-2 gap-6"
//       >
//         {/* Upload Section */}
//         <div className="flex flex-col items-center border border-dashed border-gray-300 rounded-md p-4">
//           <Upload
//             listType="picture-card"
//             showUploadList={false}
//             beforeUpload={() => false}
//           >
//             <div className="flex flex-col items-center">
//               <UploadOutlined className="text-3xl text-blue-500" />
//               <p className="text-sm text-gray-500">Upload</p>
//             </div>
//           </Upload>
//         </div>

//         {/* Right Side Form */}
//         <div>
//           <Form.Item
//             name="name"
//             label="Product Name"
//             rules={[{ required: true, message: 'Please enter product name' }]}
//           >
//             <Input placeholder="Enter product name" />
//           </Form.Item>

//           <div className="grid grid-cols-2 gap-4">
//             <Form.Item
//               name="price"
//               label="Price"
//               rules={[{ required: true, message: 'Please enter price' }]}
//             >
//               <Input placeholder="$00.00" />
//             </Form.Item>

//             <Form.Item
//               name="quantity"
//               label="Quantity"
//               rules={[{ required: true, message: 'Please enter quantity' }]}
//             >
//               <Input placeholder="100" />
//             </Form.Item>
//           </div>

//           <Form.Item>
//             <Button
//               type="primary"
//               htmlType="submit"
//               className="bg-[#007BFF] mt-2"
//             >
//               Save
//             </Button>
//           </Form.Item>
//         </div>
//       </Form>
//     </Modal>
//   );
// };

// export default AddProductModal;

'use client';

import React, { useEffect, useState } from 'react';
import { Upload, Input, Button, Form, Modal } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';

export interface ProductFormValues {
  id:string;
  name: string;
  price: string;
  quantity: string;
  image?: string; // added for edit mode
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

      // if edit mode and image exists → pre-fill Upload
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

  // const handleFinish = (values: ProductFormValues) => {
  //   const imageUrl = fileList[0]?.url || values.image; // take uploaded/initial image
  //   onSubmit({ ...values, image: imageUrl });
  //   setOpen(false);
  // };
  const handleFinish = async (values: ProductFormValues) => {
  const imageUrl = fileList[0]?.url || values.image || '/dashboard-image-1.png';

  const payload = { ...values, image: imageUrl };

  if (mode === 'add') {
    await fetch('/api/products', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  } else {
    // edit mode
    await fetch(`/api/products/${initialValues?.id}`, {
      method: 'PUT',
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
        className="grid grid-cols-2 gap-6"
      >
        {/* Upload Section */}
        <div className="flex flex-col items-center border border-dashed border-gray-300 rounded-md p-4">
          <Upload
            listType="picture-card"
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            beforeUpload={() => false} // prevent auto upload
          >
            {fileList.length === 0 && (
              <div className="flex flex-col items-center">
                <UploadOutlined className="text-3xl text-blue-500" />
                <p className="text-sm text-gray-500">Upload</p>
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

          <div className="grid grid-cols-2 gap-4">
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
              className="bg-[#007BFF] mt-2"
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

