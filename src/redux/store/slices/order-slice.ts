import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { OrderType } from '@/types/order';

export const fetchOrderDetail = createAsyncThunk(
  'orders/fetchOrderDetail',
  async (id: string) => {
    const res = await fetch(`/api/orders/${id}`);
    if (!res.ok) throw new Error('Failed to fetch order');
    const json = await res.json();
    return json.order;
  }
);

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async ({ page, pageSize, query }: { page: number; pageSize: number; query?: string }) => {
    const res = await fetch(`/api/orders?page=${page}&pageSize=${pageSize}&q=${query || ''}`, {
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

interface OrdersState {
  data: OrderType[];
  total: number;
  currentPage: number;
  query: string;
  totalOrders: number;
  totalUnits: number;
  totalAmount: number;
  order: OrderType | null;
  loadingList: boolean;
  loadingDetail: boolean; 
  error: string | null;
}

const initialState: OrdersState = {
  data: [],
  total: 0,
  currentPage: 1,
  query: '',
  totalOrders: 0,
  totalUnits: 0,
  totalAmount: 0,
  order: null,
  loadingList: false,     // 👈 for main Orders table
  loadingDetail: false,
  error: null
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
      state.currentPage = 1;
    },
    clearOrder: (state) => {
      state.order = null;
      state.error = null;
      state.loadingDetail = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loadingList = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loadingList = false;
        state.data = action.payload.orders.map((order: OrderType) => ({
          key: order.id,
          id: order.id,
          date: order.createdAt,
          userName: order.user?.fullname ?? '',
          orderStatus: order.orderStatus,
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
        state.loadingList = false;
        state.error = action.error.message || 'Error fetching orders';
      });
    builder
      .addCase(fetchOrderDetail.pending, (state) => {
        state.loadingDetail = true;
        state.error = null;
      })
      .addCase(fetchOrderDetail.fulfilled, (state, action) => {
       state.loadingDetail = false;
        state.order = action.payload;
      })
      .addCase(fetchOrderDetail.rejected, (state, action) => {
        state.loadingDetail = false;
        state.error = action.error.message || 'Error fetching order';
      });
  }
});

export const { setPage, setQuery, clearOrder } = ordersSlice.actions;
export const ordersReducer = ordersSlice.reducer;
