import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ProductType } from '@/types/product';
import { ProductFormValues } from '@/components/product-modal/product-modal';

interface ProductState {
  products: ProductType[];
  page: number;
  total: number;
  loading: boolean;
  searchTerm: string;
  sortBy: string;
  limit: number;
  pageWindow: number[];
  pageCache: Record<number, ProductType[]>;
}

const initialState: ProductState = {
  products: [],
  page: 1,
  total: 0,
  loading: false,
  searchTerm: '',
  sortBy: 'createdAt_desc',
  limit: 8,
  pageWindow: [],
  pageCache: {}
};
export const fetchProductsReplace = createAsyncThunk(
  'products/fetchProductsReplace',
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
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (
    {
      page,
      query,
      sortBy,
      limit
    }: { page: number; query: string; sortBy: string; limit: number },
    { getState, rejectWithValue }
  ) => {
    const state = getState() as { products: ProductState };

    if (state.products.pageCache[page]) {
      return {
        products: state.products.pageCache[page],
        total: state.products.total,
        page,
        limit,
        fromCache: true
      };
    }

    try {
      const res = await fetch(
        `/api/products?page=${page}&limit=${limit}&q=${query}&sortBy=${sortBy}`
      );
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      return { ...data, page, limit, fromCache: false };
    } catch (error) {
      console.error(error);
      return rejectWithValue('Failed to fetch products');
    }
  }
);

export const addProduct = createAsyncThunk(
  'products/addProduct',
  async (productData: ProductFormValues, { rejectWithValue }) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });

      const data = await res.json();
      if (!res.ok) {
        return rejectWithValue(
          data?.message || data?.error || 'Failed to add product'
        );
      }
      return;
    } catch (error) {
      console.log(error);
      return rejectWithValue('Failed to add product');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, name }: { id: string; name: string }, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      const data = await res.json();
      if (!res.ok) {
        return rejectWithValue(data?.error || 'Failed to update product');
      }
      return data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(String(error) || 'Failed to update product');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Failed to delete product');
      return id;
    } catch (error) {
      console.log(error);
      return rejectWithValue('Failed to delete product');
    }
  }
);

export const addVariant = createAsyncThunk(
  'products/addVariant',
  async (
    {
      productId,
      variantData
    }: { productId: string; variantData: Record<string, unknown> },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch(`/api/products/${productId}/variants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(variantData)
      });
      const data = await res.json();

      if (res.status === 409 && data.inactiveVariant) {
        return rejectWithValue({
          type: 'INACTIVE_VARIANT',
          variant: data.inactiveVariant,
          message: data.message
        });
      }

      if (!res.ok) {
        return rejectWithValue(data?.error || 'Failed to add product');
      }
      return { productId, variant: data };
    } catch (error) {
      return rejectWithValue(error || 'Failed to add variant');
    }
  }
);

export const updateVariant = createAsyncThunk(
  'products/updateVariant',
  async (
    {
      productId,
      variantId,
      variantData
    }: {
      productId: string;
      variantId: string;
      variantData: Record<string, unknown>;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch(
        `/api/products/${productId}/variants/${variantId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(variantData)
        }
      );

      const data = await res.json();
      if (!res.ok) {
        return rejectWithValue(data?.error || 'Failed to update variant');
      }

      return { productId, variant: data.variant };
    } catch (error) {
      return rejectWithValue(error || 'Failed to update variant');
    }
  }
);

export const reactivateVariant = createAsyncThunk(
  'products/reactivateVariant',
  async (
    {
      productId,
      variantId,
      price,
      stock
    }: {
      productId: string;
      variantId: string;
      price?: number;
      stock?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch(
        `/api/products/${productId}/variants/${variantId}/activate`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ price, stock })
        }
      );

      const data = await res.json();
      if (!res.ok) {
        return rejectWithValue(data?.error || 'Failed to reactivate variant');
      }

      return { productId, variant: data.variant };
    } catch (error) {
      return rejectWithValue(error || 'Failed to reactivate variant');
    }
  }
);

export const deleteVariant = createAsyncThunk(
  'products/deleteVariant',
  async (
    { productId, variantId }: { productId: string; variantId: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch(
        `/api/products/${productId}/variants/${variantId}`,
        { method: 'PATCH' }
      );

      if (!res.ok) throw new Error('Failed to delete variant');
      return { productId, variantId };
    } catch (error) {
      console.log(error);
      return rejectWithValue('Failed to delete variant');
    }
  }
);

const MAX_PRODUCTS = 24;
const REMOVE_COUNT = 8;

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSearchAndSort: (
      state,
      action: PayloadAction<{ searchTerm: string; sortBy: string }>
    ) => {
      state.searchTerm = action.payload.searchTerm;
      state.sortBy = action.payload.sortBy;
      state.products = [];
      state.pageWindow = [];
      state.pageCache = {};
      state.total = 0;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    resetProducts: (state) => {
      state.products = [];
      state.page = 1;
      state.total = 0;
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
          fromCache?: boolean;
        };
        state.pageCache[page] = products;
        if (!state.pageWindow.includes(page)) {
          state.pageWindow.push(page);
          state.pageWindow.sort((a, b) => a - b);
        }

        let combined = state.pageWindow.map((p) => state.pageCache[p]).flat();

        if (combined.length > MAX_PRODUCTS) {
          if (page > state.pageWindow[0]) {
            const removedPages = state.pageWindow.slice(
              0,
              REMOVE_COUNT / limit
            );
            removedPages.forEach((rp) => delete state.pageCache[rp]);
            state.pageWindow = state.pageWindow.slice(removedPages.length);
            combined = state.pageWindow.map((p) => state.pageCache[p]).flat();
          } else {
            const removedPages = state.pageWindow.slice(-REMOVE_COUNT / limit);
            removedPages.forEach((rp) => delete state.pageCache[rp]);
            state.pageWindow = state.pageWindow.slice(
              0,
              state.pageWindow.length - removedPages.length
            );
            combined = state.pageWindow.map((p) => state.pageCache[p]).flat();
          }
        }

        state.products = combined;
        state.total = total;
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

        state.products = products;
        state.total = total;
        state.page = page;
        state.limit = limit;
        state.loading = false;
      })
      .addCase(fetchProductsReplace.rejected, (state) => {
        state.loading = false;
      })

      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter((p) => p.id !== action.payload);
      })

      .addCase(addVariant.fulfilled, (state, action) => {
        const { productId, variant } = action.payload;
        const product = state.products.find((p) => p.id === productId);
        if (product) product.variants.push(variant);
      })

      .addCase(updateVariant.fulfilled, (state, action) => {
        const { productId, variant } = action.payload;
        const product = state.products.find((p) => p.id === productId);
        if (product) {
          product.variants = product.variants.map((v) =>
            v.id === variant.id ? variant : v
          );
        }
      })

      .addCase(deleteVariant.fulfilled, (state, action) => {
        const { productId, variantId } = action.payload;
        const product = state.products.find((p) => p.id === productId);
        if (product) {
          product.variants = product.variants.filter((v) => v.id !== variantId);
        }
      });
  }
});

export const { resetProducts, setSearchAndSort, setPage } =
  productSlice.actions;
export default productSlice.reducer;
