// src/store/slices/forgotPasswordSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface ForgotPasswordState {
  loading: boolean;
  message: string | null;
  error: string | null;
}

const initialState: ForgotPasswordState = {
  loading: false,
  message: null,
  error: null
};

/* ============================================================
   📩 SEND FORGOT PASSWORD EMAIL
   ============================================================ */
export const sendForgotPasswordEmail = createAsyncThunk<
  string, // return type
  string, // argument type (email)
  { rejectValue: string } // reject type
>(
  'auth/sendForgotPasswordEmail',
  async (email, { rejectWithValue }) => {
    try {
      const res = await fetch('/api/auth/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase() })
      });

      const data = await res.json();
      if (!res.ok) {
        return rejectWithValue(data.message || 'Failed to send reset link.');
      }

      return (
        data.message ||
        'If your email exists in our system, a password reset link has been sent.'
      );
    } catch (error) {
      console.error('Forgot Password error:', error);
      return rejectWithValue('Something went wrong!');
    }
  }
);

/* ============================================================
   🔑 RESET PASSWORD
   ============================================================ */
export const resetPassword = createAsyncThunk<
  string, // return type
  { token: string; password: string }, // argument type
  { rejectValue: string } // reject type
>(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const res = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });

      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(
          data.error || 'Password reset failed. Please try again.'
        );
      }

      return data.message || 'Password reset successful!';
    } catch (error) {
      console.error('Reset Password error:', error);
      return rejectWithValue('Something went wrong!');
    }
  }
);

/* ============================================================
   🧩 SLICE
   ============================================================ */
const forgotPasswordSlice = createSlice({
  name: 'authRecovery',
  initialState,
  reducers: {
    resetForgotPasswordState: (state) => {
      state.loading = false;
      state.message = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    /* --- Forgot Password --- */
    builder
      .addCase(sendForgotPasswordEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(
        sendForgotPasswordEmail.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.message = action.payload;
        }
      )
      .addCase(sendForgotPasswordEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Request failed';
      });

    /* --- Reset Password --- */
    builder
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(resetPassword.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.message = action.payload;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Request failed';
      });
  }
});

/* ============================================================
   🧾 EXPORTS
   ============================================================ */
export const { resetForgotPasswordState } = forgotPasswordSlice.actions;
export default forgotPasswordSlice.reducer;
