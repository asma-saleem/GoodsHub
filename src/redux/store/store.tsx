'use client';

import { configureStore } from '@reduxjs/toolkit';
import { ordersReducer } from './slices/ordersSlice';
import { orderDetailReducer } from './slices/orderDetailSlice';

export const store = configureStore({
  reducer: {
    orders: ordersReducer,
    orderDetail: orderDetailReducer
  }
});

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
