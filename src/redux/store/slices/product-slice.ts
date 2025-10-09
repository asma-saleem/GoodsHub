import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ProductType } from '@/types/product';

interface ProductState {
  products: ProductType[];
  page: number;
  total: number;
  loading: boolean;
  searchTerm: string;
  sortBy: string;
  limit: number;
}

const initialState: ProductState = {
  products: [],
  page: 1,
  total: 0,
  loading: false,
  searchTerm: '',
  sortBy: 'createdAt_desc', 
  limit: 8
};

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (
    {
      page,
      query,
      sortBy,
      limit
    }: { page: number; query: string; sortBy: string; limit: number },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch(
        `/api/products?page=${page}&limit=${limit}&q=${query}&sortBy=${sortBy}`
      );

      if (!res.ok) throw new Error('Failed to fetch products');

      const data = await res.json();
      return { ...data, page, limit };
    } catch (error) {
      console.error(error);
      return rejectWithValue('Failed to fetch products');
    }
  }
);
export const fetchProductsReplace = createAsyncThunk(
  'products/fetchProductsReplace',
  async (
    { page, query, sortBy, limit }: { page: number; query: string; sortBy: string; limit: number },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch(
        `/api/products?page=${page}&limit=${limit}&q=${query}&sortBy=${sortBy}`
      );

      if (!res.ok) throw new Error('Failed to fetch products');

      const data = await res.json();
      return { ...data, page, limit };
    } catch (error) {
      console.error(error);
      return rejectWithValue('Failed to fetch products');
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    resetProducts: (state) => {
      state.products = [];
      state.page = 1;
      state.total = 0;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setSearchAndSort: (
      state,
      action: PayloadAction<{ searchTerm: string; sortBy: string }>
    ) => {
      state.searchTerm = action.payload.searchTerm;
      state.sortBy = action.payload.sortBy;
      state.page = 1;
      state.products = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        const { products, total, page, limit } = action.payload as {
          products: ProductType[];
          total: number;
          page: number;
          limit: number;
        };

        // ✅ Handle first page vs infinite scroll
        state.products =
          page === 1 ? products : [...state.products, ...products];

        state.total = total;
        state.page = page;
        state.limit = limit;
        state.loading = false;
      })
      .addCase(fetchProducts.rejected, (state) => {
        state.loading = false;
      });
      builder
      .addCase(fetchProductsReplace.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductsReplace.fulfilled, (state, action) => {
        const { products, total, page, limit } = action.payload as {
          products: ProductType[];
          total: number;
          page: number;
          limit: number;
        };

        // ✅ Always replace products
        state.products = products;
        state.total = total;
        state.page = page;
        state.limit = limit;
        state.loading = false;
      })
      .addCase(fetchProductsReplace.rejected, (state) => {
        state.loading = false;
      });
  }
});

export const { resetProducts, setSearchAndSort, setPage } = productSlice.actions;
export default productSlice.reducer;
