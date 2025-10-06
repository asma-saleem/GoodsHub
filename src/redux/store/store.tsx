'use client';

import { configureStore } from '@reduxjs/toolkit';

import { ordersReducer } from './slices/order-slice';
import productReducer from './slices/product-slice';

export const store = configureStore({
  reducer: {
    orders: ordersReducer,
    products: productReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
