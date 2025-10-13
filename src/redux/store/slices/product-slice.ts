// import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
// import { ProductType } from '@/types/product';

// interface ProductState {
//   products: ProductType[];
//   page: number;
//   total: number;
//   loading: boolean;
//   searchTerm: string;
//   sortBy: string;
//   limit: number;
// }

// const initialState: ProductState = {
//   products: [],
//   page: 1,
//   total: 0,
//   loading: false,
//   searchTerm: '',
//   sortBy: 'createdAt_desc', 
//   limit: 8
// };

// export const fetchProducts = createAsyncThunk(
//   'products/fetchProducts',
//   async (
//     {
//       page,
//       query,
//       sortBy,
//       limit
//     }: { page: number; query: string; sortBy: string; limit: number },
//     { rejectWithValue }
//   ) => {
//     try {
//       const res = await fetch(
//         `/api/products?page=${page}&limit=${limit}&q=${query}&sortBy=${sortBy}`
//       );

//       if (!res.ok) throw new Error('Failed to fetch products');

//       const data = await res.json();
//       return { ...data, page, limit };
//     } catch (error) {
//       console.error(error);
//       return rejectWithValue('Failed to fetch products');
//     }
//   }
// );
// export const fetchProductsReplace = createAsyncThunk(
//   'products/fetchProductsReplace',
//   async (
//     { page, query, sortBy, limit }: { page: number; query: string; sortBy: string; limit: number },
//     { rejectWithValue }
//   ) => {
//     try {
//       const res = await fetch(
//         `/api/products?page=${page}&limit=${limit}&q=${query}&sortBy=${sortBy}`
//       );

//       if (!res.ok) throw new Error('Failed to fetch products');

//       const data = await res.json();
//       return { ...data, page, limit };
//     } catch (error) {
//       console.error(error);
//       return rejectWithValue('Failed to fetch products');
//     }
//   }
// );

// const productSlice = createSlice({
//   name: 'products',
//   initialState,
//   reducers: {
//     resetProducts: (state) => {
//       state.products = [];
//       state.page = 1;
//       state.total = 0;
//     },
//     setPage: (state, action: PayloadAction<number>) => {
//       state.page = action.payload;
//     },
//     setSearchAndSort: (
//       state,
//       action: PayloadAction<{ searchTerm: string; sortBy: string }>
//     ) => {
//       state.searchTerm = action.payload.searchTerm;
//       state.sortBy = action.payload.sortBy;
//       state.page = 1;
//       state.products = [];
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchProducts.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(fetchProducts.fulfilled, (state, action) => {
//         const { products, total, page, limit } = action.payload as {
//           products: ProductType[];
//           total: number;
//           page: number;
//           limit: number;
//         };

//         // ✅ Handle first page vs infinite scroll
//         state.products =
//           page === 1 ? products : [...state.products, ...products];

//         state.total = total;
//         state.page = page;
//         state.limit = limit;
//         state.loading = false;
//       })
//       .addCase(fetchProducts.rejected, (state) => {
//         state.loading = false;
//       });
//       builder
//       .addCase(fetchProductsReplace.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(fetchProductsReplace.fulfilled, (state, action) => {
//         const { products, total, page, limit } = action.payload as {
//           products: ProductType[];
//           total: number;
//           page: number;
//           limit: number;
//         };

//         // ✅ Always replace products
//         state.products = products;
//         state.total = total;
//         state.page = page;
//         state.limit = limit;
//         state.loading = false;
//       })
//       .addCase(fetchProductsReplace.rejected, (state) => {
//         state.loading = false;
//       });
//   }
// });

// export const { resetProducts, setSearchAndSort, setPage } = productSlice.actions;
// export default productSlice.reducer;

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

        let combined = state.pageWindow
          .map((p) => state.pageCache[p])
          .flat();

        if (combined.length > MAX_PRODUCTS) {
          if (page > state.pageWindow[0]) {
            const removedPages = state.pageWindow.slice(0, REMOVE_COUNT / limit);
            removedPages.forEach((rp) => delete state.pageCache[rp]);
            state.pageWindow = state.pageWindow.slice(removedPages.length);
            combined = state.pageWindow.map((p) => state.pageCache[p]).flat();
          } else {
            const removedPages = state.pageWindow.slice(
              -REMOVE_COUNT / limit
            );
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
      });
  }
  }
);

export const { resetProducts, setSearchAndSort, setPage } = productSlice.actions;
export default productSlice.reducer;
