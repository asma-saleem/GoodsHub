'use client';
import React, { useEffect, useState, useRef } from 'react';
import { Col, Row, Spin } from 'antd';
import ProductCard from './card';
import { ProductType } from '@/types/product';

interface ProductGridProps {
  searchTerm: string;
  sortBy: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({ searchTerm, sortBy }) => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const loaderRef = useRef<HTMLDivElement | null>(null);

  const fetchProducts = async (
    pageNum: number,
    query: string = '',
    sort: string
  ) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/products?page=${pageNum}&limit=8&q=${query}&sortBy=${sort}`
      );
      const data = await res.json();

      if (pageNum === 1) setProducts(data.products);
      else setProducts((prev) => [...prev, ...data.products]);

      // ✅ Set total count for lazy load limit
      setTotal(data.total);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    setPage(1);
    fetchProducts(1, searchTerm, sortBy);
  }, [searchTerm, sortBy]);

  // Intersection Observer for lazy load on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !loading && products.length < total) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchProducts(nextPage, searchTerm, sortBy);
        }
      },
      { threshold: 1.0 }
    );
    const currentLoader = loaderRef.current;
    if (currentLoader) observer.observe(currentLoader);
    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [loading, products.length, total, page, searchTerm, sortBy]); 

  return (
    <>
      <Row
        gutter={[
          { xs: 12, sm: 12, lg: 30, xl: 30 },
          { xs: 12, sm: 12, lg: 32, xl: 32 }
        ]}
        justify='start'
      >
        {products.map((product) => (
          <Col key={product.id} span={6} xs={12} sm={12} lg={8} xl={6}>
            <ProductCard product={product} />
          </Col>
        ))}
      </Row>

      <div ref={loaderRef} className='flex justify-center mt-8'>
        {loading && <Spin size='large' />}
      </div>
    </>
  );
};

export default ProductGrid;
