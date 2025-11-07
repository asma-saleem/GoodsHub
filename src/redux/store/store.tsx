'use client';

import { configureStore } from '@reduxjs/toolkit';

import { ordersReducer } from './slices/order-slice';
import productReducer from './slices/product-slice';
import authReducer from './slices/auth-slice';

export const store = configureStore({
  reducer: {
    orders: ordersReducer,
    products: productReducer,
    auth: authReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

