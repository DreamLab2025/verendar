import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { deleteCookie, setCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";
import type { AppDispatch, RootState } from "@/lib/redux/store";
import { AuthService } from "@/lib/api/services/fetchAuth";
import { getAuthCookieConfig } from "@/utils/cookieConfig";
import api8080Service from "@/lib/api/api8080Service";
import apiService from "@/lib/api/apiService";

interface User {
  id: string;
  email: string;
  fullName?: string;
  role: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface LoginRequest {
  email: string;
  password: string;
}

let refreshTimer: NodeJS.Timeout | null = null;

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

function decodeUser(token: string): User | null {
  try {
    const decoded = jwtDecode<User>(token);
    return {
      ...decoded,
      role: Array.isArray(decoded.role) ? decoded.role : [decoded.role].filter(Boolean),
    };
  } catch {
    return null;
  }
}

export function setupAutoRefresh(token: string, dispatch: AppDispatch) {
  if (refreshTimer) clearTimeout(refreshTimer);
  const decoded = jwtDecode<{ exp?: number }>(token);
  if (!decoded.exp) return;
  const time = decoded.exp * 1000 - Date.now() - 2 * 60 * 1000;
  if (time <= 0) return;
  refreshTimer = setTimeout(() => {
    dispatch(logout());
  }, time);
}

export const loginAsync = createAsyncThunk(
  "auth/login",
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await AuthService.login(credentials.email, credentials.password);
      if (!response.data.isSuccess) return rejectWithValue(response.data.message);
      return response.data.data;
    } catch {
      return rejectWithValue("Login failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      deleteCookie("authToken", { path: "/" });
      deleteCookie("auth-token", { path: "/" });
      api8080Service.setAuthToken(null);
      apiService.setAuthToken(null);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.user = decodeUser(action.payload.accessToken);
        state.isAuthenticated = true;
        setCookie("authToken", action.payload.accessToken, getAuthCookieConfig());
        setCookie("auth-token", action.payload.accessToken, getAuthCookieConfig());
        api8080Service.setAuthToken(action.payload.accessToken);
        apiService.setAuthToken(action.payload.accessToken);
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
