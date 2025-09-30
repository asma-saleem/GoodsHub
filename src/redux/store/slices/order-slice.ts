import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { OrderType } from '@/types/order';

interface OrdersState {
  data: OrderType[];
  total: number;
  loading: boolean;
  error: string | null;
  currentPage: number;
  query: string;
  totalOrders: number;
  totalUnits: number;
  totalAmount: number;
}

const initialState: OrdersState = {
  data: [],
  total: 0,
  loading: false,
  error: null,
  currentPage: 1,
  query: '',
  totalOrders: 0,
  totalUnits: 0,
  totalAmount: 0
};

// Async thunk
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async ({ page, pageSize, query }: { page: number; pageSize: number; query?: string }) => {
    const res = await fetch(`/api/orders?page=${page}&pageSize=${pageSize}&q=${query}`, {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin'
    });
    if (!res.ok) throw new Error('Failed to fetch orders');
    const json = await res.json();
    return {
      orders: json.orders,
      total: json.total,
      totalOrders: json.total || 0,
      totalUnits: json.totalUnits || 0,
      totalAmount: json.totalAmount || 0,
      page,
      query: query || ''
    };
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setQuery: (state, action) => {
      state.query = action.payload;
      state.currentPage = 1; 
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.orders.map((order: OrderType) => ({
          key: order.id,
          id: order.id,
          date: new Date(order.createdAt).toLocaleDateString(),
          userName: order.user?.fullname ?? '',
          orderNo: order.orderNo,
          products: order.items?.length || 0,
          amount: order.total || 0
        }));
        state.total = action.payload.total;
        state.totalOrders = action.payload.totalOrders;
        state.totalUnits = action.payload.totalUnits;
        state.totalAmount = action.payload.totalAmount;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error fetching orders';
      });
  }
});

export const { setPage, setQuery  } = ordersSlice.actions;
export const ordersReducer = ordersSlice.reducer;
