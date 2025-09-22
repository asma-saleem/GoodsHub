import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { OrderType } from '@/types/order';

interface OrderDetailState {
  order: OrderType | null;
  loading: boolean;
  error: string | null;
}

const initialState: OrderDetailState = {
  order: null,
  loading: false,
  error: null
};

export const fetchOrderDetail = createAsyncThunk(
  'orderDetail/fetchOrderDetail',
  async (id: string) => {
    const res = await fetch(`/api/orders/${id}`);
    if (!res.ok) throw new Error('Failed to fetch order');
    const json = await res.json();
    return json.order;
  }
);

const orderDetailSlice = createSlice({
  name: 'orderDetail',
  initialState,
  reducers: {
    clearOrder: (state) => {
      state.order = null;
      state.error = null;
      state.loading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrderDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(fetchOrderDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error fetching order';
      });
  }
});

export const { clearOrder } = orderDetailSlice.actions;
export const orderDetailReducer = orderDetailSlice.reducer;
