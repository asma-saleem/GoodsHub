import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface ForgotPasswordState {
  loading: boolean;
  message: string | null;
  error: string | null;
}
interface UserType {
  id: string;
  fullname: string;
  email: string;
  mobile?: string | null;
  stripeCustomerId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

const initialState: ForgotPasswordState = {
  loading: false,
  message: null,
  error: null
};

export const signupUser = createAsyncThunk<
  UserType,
  { fullname: string; email: string; mobile?: string; password: string },
  { rejectValue: string }
>('auth/signupUser', async (values, { rejectWithValue }) => {
  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values)
    });

    const data: { user?: UserType; error?: string } = await res.json();

    if (!res.ok || !data.user) {
      return rejectWithValue(data.error || 'Signup failed');
    }

    return data.user;
  } catch (error) {
    console.error('Signup error:', error);
    return rejectWithValue('Something went wrong during signup');
  }
});

export const sendForgotPasswordEmail = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('auth/sendForgotPasswordEmail', async (email, { rejectWithValue }) => {
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
});

export const resetPassword = createAsyncThunk<
  string,
  { token: string; password: string },
  { rejectValue: string }
>('auth/resetPassword', async ({ token, password }, { rejectWithValue }) => {
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
});

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
    builder
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(signupUser.fulfilled, (state) => {
        state.loading = false;
        state.message = 'Signup successful!';
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Signup failed';
      });

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

    builder
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(
        resetPassword.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.message = action.payload;
        }
      )
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Request failed';
      });
  }
});

export const { resetForgotPasswordState } = forgotPasswordSlice.actions;
export default forgotPasswordSlice.reducer;
