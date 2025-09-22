import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { OrderType } from '@/types/order';

interface OrdersState {
  data: OrderType[];
  total: number;
  loading: boolean;
  error: string | null;
  currentPage: number;
}

const initialState: OrdersState = {
  data: [],
  total: 0,
  loading: false,
  error: null,
  currentPage: 1
};

// Async thunk
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async ({ page, pageSize }: { page: number; pageSize: number }) => {
    const res = await fetch(`/api/orders?page=${page}&pageSize=${pageSize}`, {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin'
    });
    if (!res.ok) throw new Error('Failed to fetch orders');
    const json = await res.json();
    return {
      orders: json.orders,
      total: json.total,
      page
    };
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.currentPage = action.payload;
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
        state.data = action.payload.orders.map((order: OrderType, index: number) => ({
          id: order.id,
          key: index,
          date: new Date(order.createdAt).toLocaleDateString(),
          orderNo: order.id || `ORD-${index + 1}`,
          products: order.items?.length || 0,
          amount: order.total || 0
        }));
        state.total = action.payload.total;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error fetching orders';
      });
  }
});

export const { setPage } = ordersSlice.actions;
export const ordersReducer = ordersSlice.reducer;
