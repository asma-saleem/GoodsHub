// import React from 'react';
// import { Col, Row } from 'antd';
// import ProductCard from './card';

// export const products = [
//   {
//     image: '/shirts.png',
//     title: 'Bluetooth Wireless Speaker with Superior Sound Quality',
//     price: 200
//   },
//   {
//     image: '/shirts.png',
//     title: 'Bluetooth Wireless Speaker with Superior Sound Quality',
//     price: 120
//   },
//   {
//     image: '/shirts.png',
//     title: 'Wireless Headphones with Noise Cancellation',
//     price: 300
//   },
//   {
//     image: '/shirts.png',
//     title: 'Wireless Headphones with Noise Cancellation',
//     price: 250
//   },
//   {
//     image: '/shirts.png',
//     title: 'Bluetooth Wireless Speaker with Superior Sound Quality',
//     price: 200
//   },
//   {
//     image: '/shirts.png',
//     title: 'Bluetooth Wireless Speaker with Superior Sound Quality',
//     price: 200
//   },
//   {
//     image: '/shirts.png',
//     title: 'Bluetooth Wireless Speaker with Superior Sound Quality',
//     price: 200
//   },
//   {
//     image: '/shirts.png',
//     title: 'Bluetooth Wireless Speaker with Superior Sound Quality',
//     price: 200
//   },
//   {
//     image: '/shirts.png',
//     title: 'Bluetooth Wireless Speaker with Superior Sound Quality',
//     price: 200
//   },
//   {
//     image: '/shirts.png',
//     title: 'Bluetooth Wireless Speaker with Superior Sound Quality',
//     price: 200
//   },
//   {
//     image: '/shirts.png',
//     title: 'Bluetooth Wireless Speaker with Superior Sound Quality',
//     price: 200
//   },
//   {
//     image: '/shirts.png',
//     title: 'Bluetooth Wireless Speaker with Superior Sound Quality',
//     price: 200
//   },
//   {
//     image: '/shirts.png',
//     title: 'Bluetooth Wireless Speaker with Superior Sound Quality',
//     price: 200
//   },
//   {
//     image: '/shirts.png',
//     title: 'Bluetooth Wireless Speaker with Superior Sound Quality',
//     price: 200
//   },
//   {
//     image: '/shirts.png',
//     title: 'Bluetooth Wireless Speaker with Superior Sound Quality',
//     price: 200
//   },
//   {
//     image: '/shirts.png',
//     title: 'Bluetooth Wireless Speaker with Superior Sound Quality',
//     price: 200
//   }
// ];

// const GridE: React.FC = () => (
//   <>
//     <Row
//       gutter={[
//         { xs: 12, sm: 12, lg: 30, xl: 30 }, // horizontal gutter
//         { xs: 12, sm: 12, lg: 32, xl: 32 } // vertical gutter
//       ]}
//       justify='start'
//     >
//       {products.map((product, index) => (
//         <Col key={index} span={6} xs={12} sm={12} lg={8} xl={6}>
//           <ProductCard
//             image={product.image}
//             title={product.title}
//             price={product.price}
//           />
//         </Col>
//       ))}
//     </Row>
//   </>
// );

// export default GridE;


'use client';
import React, { useEffect, useState } from 'react';
import { Col, Row } from 'antd';
import ProductCard from './card';

const GridE: React.FC = () => {
  type Product = {
  id: number;
  image: string;
  title: string;
  price: number;
};
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error('Failed to fetch products:', err));
  }, []);

  return (
    <>
      <Row
        gutter={[
          { xs: 12, sm: 12, lg: 30, xl: 30 }, // horizontal gutter
          { xs: 12, sm: 12, lg: 32, xl: 32 } // vertical gutter
        ]}
        justify="start"
      >
        {products.map((product, index) => (
          <Col key={index} span={6} xs={12} sm={12} lg={8} xl={6}>
            <ProductCard
              image={product.image}
              title={product.title}
              price={product.price}
            />
          </Col>
        ))}
      </Row>
    </>
  );
};

export default GridE;
