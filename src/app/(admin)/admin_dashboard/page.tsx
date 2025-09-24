// 'use client';

// import React, { useState, useEffect } from 'react';
// import {
//   Layout,
//   Menu,
//   Button,
//   Table,
//   Avatar,
//   Space,
//   Spin
// } from 'antd';
// import {
//   ProductOutlined,
//   UnorderedListOutlined,
//   LogoutOutlined,
//   EditOutlined,
//   DeleteOutlined
// } from '@ant-design/icons';
// import { ProductType } from '@/types/product';
// import { useSession, signOut } from 'next-auth/react';
// // import Image from 'next/image';

// const { Header, Sider, Content } = Layout;

// const AdminDashboard: React.FC = () => {
//   const { data: session } = useSession(); 
//   const [products, setProducts] = useState<ProductType[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [page, setPage] = useState(1);
//   const [pageSize, setPageSize] = useState(12);
//   const [total, setTotal] = useState(0);

//   // Fetch products from API
//   const fetchProducts = async (pageNum: number, limit: number) => {
//     setLoading(true);
//     try {
//       const res = await fetch(`/api/products?page=${pageNum}&limit=${limit}`);
//       const data = await res.json();
//       setProducts(data.products);
//       setTotal(data.total); // <-- API se total count bhejna hoga
//     } catch (err) {
//       console.error('❌ Failed to fetch products:', err);
//     }
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchProducts(page, pageSize);
//   }, [page, pageSize]);

//   // Table columns
//   const columns = [
//     {
//       title: 'Title',
//       dataIndex: 'title',
//       key: 'title',
//       render: (text: string, record: ProductType) => (
//         <Space>
//           <Avatar shape="square" size={24} src={record.image} />
//           <span className="font-inter font-normal text-[12px] leading-[100%]">{text}</span>
//         </Space>
//       )
//     },
//     {
//       title: 'Price',
//       dataIndex: 'price',
//       key: 'price',
//       render: (price: number) => `$${price.toFixed(2)}`
//     },
//     {
//       title: 'Stock',
//       dataIndex: 'stock',
//       key: 'stock'
//     },
//     {
//       title: 'Actions',
//       key: 'actions',
//       render: () => (
//         <Space>
//           <Button type="text" icon={<EditOutlined />} />
//           <Button danger type="text" icon={<DeleteOutlined />} />
//         </Space>
//       )
//     }
//   ];

//   return (
//     <Layout style={{ minHeight: '100vh' }}>
//       {/* Sidebar */}
//       <Sider width={257} style={{ background: '#fff' }}>
//         <p className='font-inter font-bold text-[16px] leading-6 pt-3 pb-6 pl-5 pr-[136px]'>
//           E-commerce
//         </p>
//         <div className="flex justify-center">  
//         <Menu
//           mode="inline"
//           defaultSelectedKeys={['products']}
//           className="
//           !w-auto !inline-block 
//            [&_.ant-menu-item]:!rounded-lg 
//            [&_.ant-menu-item]:!px-6 
//            [&_.ant-menu-item]:!py-1
//            [&_.ant-menu-item]:!flex 
//            [&_.ant-menu-item]:!items-center 
//            [&_.ant-menu-item]:!justify-center
//          [&_.ant-menu-item]:!bg-white 
//          [&_.ant-menu-item]:!text-black
//           [&_.ant-menu-item]:!w-[217px]       
//           [&_.ant-menu-item]:!h-[48px]    
//          [&_.ant-menu-item-selected]:!bg-[#007BFF] 
//          [&_.ant-menu-item-selected]:!text-white"

//           items={[
//             {
//               key: 'products',
//               icon: <ProductOutlined className="!text-[20px]"/>,
//               label: (
//                <span className="font-inter font-semibold text-[16px] leading-[22px] align-middle">
//                Products
//               </span>
//                )
//             },
//             {
//               key: 'orders',
//               icon: <UnorderedListOutlined className="!text-[20px]" />,
//               label: (<span className="font-inter font-medium text-[16px] leading-[22px] tracking-[0px] align-middle">
//               Orders
//              </span>)
//             }
//           ]}
//         /></div>
//         <div
//           style={{
//             position: 'absolute',
//             bottom: 20,
//             width: '100%',
//             textAlign: 'center'
//           }}
//         >
//           <Button type="link" onClick={() => signOut()} danger icon={<LogoutOutlined className="!text-[20px]" style={{ color: '#EF1014' }} />} className="!pl-0 font-inter !font-semibold text-[14px] leading-[22px] align-middle !text-[#EF1014]">
//             Logout
//           </Button>
//         </div>
//       </Sider>

//       {/* Main Layout */}
//       <Layout>
//         {/* Header */}
//         <Header
//           style={{
//             background: '#fff',
//             padding: '18px 36px',
//             display: 'flex',
//             justifyContent: 'space-between',
//             alignItems: 'center',
//             borderBottom: '1px solid #eee',
//             height:'48px'
//           }}
//         >
//           <h3 style={{ margin: 0 }}></h3>
//           <span className="!p-0 !m-0 font-inter font-medium text-[12px] leading-[12px] text-right text-[#007BFF]">{session?.user?.name || 'Guest'}</span>
//         </Header>

//         {/* Content */}
//         <Content style={{ margin: '16px', padding: 24, background: '#fff' }}>
          
//         <div className='flex small:flex-col small:pt-5 small:pb-3 small:gap-y-2 mobile:flex-col mobile:pt-6 mobile:pb-4 mobile:gap-y-3 tablet:flex-row tablet:justify-between tablet:items-center tablet:pt-8 tablet:pb-6'>
//           <h4 className='font-inter font-medium text-2xl leading-[28.8px] text-[#007BFF] !mb-0'>
//             Products
//           </h4>
//           <div className='flex items-center gap-6'>
//            <Button
//                 className='!w-[203px] !h-[36px] !text-[#007BFF] !border-[#007BFF] hover:!bg-[#007BFF] hover:!text-white'

//               >+ Add a single Product</Button>
//             <Button
//                 className='!w-[203px] !h-[36px] !text-[#007BFF] !border-[#007BFF] hover:!bg-[#007BFF] hover:!text-white'
//               >+ Add Multiple Products</Button>
//           </div>
//         </div>

//           {loading ? (
//             <div className="flex justify-center">
//               <Spin size="large" />
//             </div>
//           ) : (
//             <Table
//               dataSource={products}
//               columns={columns}
//               rowKey="id"
//               pagination={{
//                 current: page,
//                 pageSize: pageSize,
//                 total: total,
//                 onChange: (p, ps) => {
//                   setPage(p);
//                   setPageSize(ps);
//                 }
//               }}
//               className="[&_.ant-table-cell]:!py-2 [&_.ant-table-thead_.ant-table-cell]:!text-[#535E63]"
//             />
//           )}
//         </Content>
//       </Layout>
//     </Layout>
//   );
// };

// export default AdminDashboard;


'use client';

import React from 'react';
import AdminLayout from '@/components/admin_layout';

const AdminDashboard: React.FC = () => {
  return <AdminLayout />;
};

export default AdminDashboard;
