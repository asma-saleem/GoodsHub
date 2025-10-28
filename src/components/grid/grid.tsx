'use client';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Col, Empty, Row, Spin } from 'antd';
import { useAppDispatch, useAppSelector } from '@/redux/store/hooks';
import {
  fetchProducts,
  setSearchAndSort
} from '@/redux/store/slices/product-slice';
import ProductCard from '../card/card';
import { ProductType, ProductVariantType } from '@/types/product';

import './grid.css';

interface ProductGridProps {
  searchTerm: string;
  sortBy: string;
}

const SCROLL_TRIGGER_OFFSET = 100;

const ProductGrid: React.FC<ProductGridProps> = ({ searchTerm, sortBy }) => {
  const dispatch = useAppDispatch();
  const { products, loading, total, pageWindow, limit } = useAppSelector(
    (state) => state.products
  );

  const [topLoading, setTopLoading] = useState(false);
  const hasFetched = useRef(false);
  const prevScrollHeight = useRef<number>(0);

  useEffect(() => {
    hasFetched.current = true;
    dispatch(setSearchAndSort({ searchTerm, sortBy }));
    dispatch(fetchProducts({ page: 1, query: searchTerm, sortBy, limit }));
  }, [searchTerm, sortBy, dispatch, limit]);
  
  useEffect(() => {
  if (!products?.length) return;
  for (const key in localStorage) {
    if (!key.startsWith('cart_')) continue;

    const cart: {
      id: string;
      variantId: string; 
      stock: number;
    }[] = JSON.parse(localStorage.getItem(key) || '[]');

    let updated = false;

    const updatedCart = cart.map((item) => {
      const matchedProduct = products.find(
        (p: ProductType) => p.id === item.id
      );

      const matchedVariant = matchedProduct?.variants.find(
        (v: ProductVariantType) => v.id === item.variantId
      );

      if (matchedVariant && item.stock !== matchedVariant.stock) {
        updated = true;
        return { ...item, stock: matchedVariant.stock };
      }

      return item;
    });

    if (updated) {
      localStorage.setItem(key, JSON.stringify(updatedCart));
      window.dispatchEvent(new Event('cartUpdated'));
      console.log(`✅ Cart updated for ${key}`);
    }
  }
}, [products]);

  useLayoutEffect(() => {
    if (topLoading && prevScrollHeight.current) {
      const diff =
        document.documentElement.scrollHeight - prevScrollHeight.current;
      window.scrollTo({ top: diff });
      prevScrollHeight.current = 0;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  useEffect(() => {
    const handleScroll = async () => {
      if (loading || total === 0) return;

      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;
      const firstPage = pageWindow[0];
      const lastPage = pageWindow[pageWindow.length - 1];

      const isBottom =
        windowHeight + scrollTop >= scrollHeight - SCROLL_TRIGGER_OFFSET &&
        !loading &&
        products.length < total;

      if (isBottom) {
        const nextPage = lastPage + 1;
        const maxPage = Math.ceil(total / limit);
        if (nextPage <= maxPage) {
          dispatch(
            fetchProducts({ page: nextPage, query: searchTerm, sortBy, limit })
          );
        }
      }
      const isTop =
        scrollTop <= SCROLL_TRIGGER_OFFSET && !loading && firstPage > 1;
      if (isTop) {
        setTopLoading(true);
        prevScrollHeight.current = document.documentElement.scrollHeight;

        const prevPage = firstPage - 1;
        if (prevPage >= 1) {
          await dispatch(
            fetchProducts({ page: prevPage, query: searchTerm, sortBy, limit })
          );
        }

        setTimeout(() => setTopLoading(false), 300);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [
    loading,
    products.length,
    total,
    pageWindow,
    searchTerm,
    sortBy,
    limit,
    dispatch
  ]);

  return (
    <div style={{ position: 'relative' }}>
      {topLoading && (
        <div
          className='grid-loading'
          style={{ textAlign: 'center', padding: '20px 0' }}
        >
          <Spin size='large' />
        </div>
      )}
      {products.length === 0 && !loading && hasFetched.current ? (
        <div className='grid-empty'>
          <Empty description='No matching products found' />
        </div>
      ) : (
        <Row
          gutter={[
            { xs: 12, sm: 12, lg: 30, xl: 30 },
            { xs: 12, sm: 12, lg: 32, xl: 32 }
          ]}
          justify='start'
        >
          {products.map((product) => (
            <Col key={product.id} span={6} xs={12} sm={12} md={8} lg={8} xl={6}>
              <ProductCard product={product} />
            </Col>
          ))}
        </Row>
      )}
      <div
        className="grid-loading"
        style={{
          textAlign: 'center',
          padding: products.length === 0 ? '200px 0' : '20px 0',
          display: 'flex',
          justifyContent: 'center',
          alignItems: products.length === 0 ? 'center' : 'flex-start',
          minHeight: products.length === 0 ? '60vh' : 'auto'
        }}
      >
        {(loading && products.length === 0) ||
        (loading && products.length < total) ? (
          <Spin size="large" />
        ) : null}
      </div>

    </div>
  );
};

export default ProductGrid;
