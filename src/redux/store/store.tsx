'use client';

import { configureStore } from '@reduxjs/toolkit';

import { ordersReducer } from './slices/order-slice';
import productReducer from './slices/product-slice';
import { orderDetailReducer } from './slices/order-detail-slice';

export const store = configureStore({
  reducer: {
    orders: ordersReducer,
    orderDetail: orderDetailReducer,
    products: productReducer
  }
});

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
