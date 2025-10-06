'use client';

import React, { useEffect, useRef } from 'react';
import { Col, Empty, Row, Spin  } from 'antd';

import { useAppDispatch, useAppSelector } from '@/redux/store/hooks';
import { fetchProducts, setSearchAndSort } from '@/redux/store/slices/product-slice';
import ProductCard from '../card/card';
import './grid.css';

interface ProductGridProps {
  searchTerm: string;
  sortBy: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({ searchTerm, sortBy }) => {
  const dispatch = useAppDispatch();
  const { products, loading, total, page } = useAppSelector(
    (state) => state.products
  );
  const hasFetched = useRef(false);

  useEffect(() => {
    hasFetched.current = true;
    dispatch(setSearchAndSort({ searchTerm, sortBy }));
    dispatch(fetchProducts({ page: 1, query: searchTerm, sortBy, limit:8 }));
  }, [searchTerm, sortBy, dispatch]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 100 &&
        !loading &&
        products.length < total
      ) {
        dispatch(fetchProducts({ page: page + 1, query: searchTerm, sortBy, limit:8 }));
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, products.length, total, page, searchTerm, sortBy, dispatch]);

  return (
    <>
    {products.length === 0 && !loading  && hasFetched.current? (
        <div className="grid-empty">
          <Empty description="No matching products found" /> 
        </div>
      ) : (
      <Row
        gutter={[
          { xs: 12, sm: 12, lg: 30, xl: 30 },
          { xs: 12, sm: 12, lg: 32, xl: 32 }
        ]}
        justify="start"
      >
        {products.map((product) => (
          <Col key={product.id} span={6} xs={12} sm={12} md={8} lg={8} xl={6}>
            <ProductCard product={product} />
          </Col>
        ))}
      </Row>
      )}
      <div className="grid-loading">
        {loading && <Spin size="large" />}
      </div>
    </>
  );
};

export default ProductGrid;