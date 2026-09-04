import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_BASE } from '../services/apiService';

// Lấy hoặc tạo guestId duy nhất lưu trong localStorage
export function getGuestId() {
  let id = localStorage.getItem('guest_cart_id');
  if (!id) {
    id = 'guest_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    localStorage.setItem('guest_cart_id', id);
  }
  return id;
}

// ─── ASYNC THUNKS cho Guest Cart (không cần login) ───────────────────────────

/** Lấy giỏ hàng của guest từ BE */
export const fetchGuestCart = createAsyncThunk('cart/fetchGuest', async (_, { rejectWithValue }) => {
  try {
    const u_id = getGuestId();
    const res = await fetch(`${API_BASE}/api/cart/${u_id}`);
    const data = await res.json();
    if (!data.success) return rejectWithValue(data.message);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

/** Thêm item vào giỏ guest */
export const addToGuestCartAPI = createAsyncThunk('cart/addGuest', async ({ variant_id, quantity, price }, { rejectWithValue }) => {
  try {
    const u_id = getGuestId();
    const res = await fetch(`${API_BASE}/api/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ u_id, variant_id, quantity, price }),
    });
    const data = await res.json();
    if (!data.success) return rejectWithValue(data.message);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

/** Cập nhật số lượng item guest */
export const updateGuestCartAPI = createAsyncThunk('cart/updateGuest', async ({ cartItemId, quantity }, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API_BASE}/api/cart/${cartItemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    });
    const data = await res.json();
    if (!data.success) return rejectWithValue(data.message);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

/** Xóa item khỏi giỏ guest */
export const removeGuestCartAPI = createAsyncThunk('cart/removeGuest', async (cartItemId, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API_BASE}/api/cart/${cartItemId}`, { method: 'DELETE' });
    const data = await res.json();
    if (!data.success) return rejectWithValue(data.message);
    return cartItemId;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

/** Xóa toàn bộ giỏ guest */
export const clearGuestCartAPI = createAsyncThunk('cart/clearGuest', async (_, { rejectWithValue }) => {
  try {
    const u_id = getGuestId();
    const res = await fetch(`${API_BASE}/api/cart/clear/${u_id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!data.success) return rejectWithValue(data.message);
    return true;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

// ─── SLICE ───────────────────────────────────────────────────────────────────

// Nếu có API, sau này ta có thể dùng createAsyncThunk để call API backend
const initialState = {
  items: JSON.parse(localStorage.getItem('cartItems')) || [],
  // Guest cart items từ BE (dạng CartItem document)
  guestItems: [],
  status: 'idle',
  guestStatus: 'idle',
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const existingItem = state.items.find(
        (i) => i.product_id === item.product_id && i.variant_id === item.variant_id
      );
      if (existingItem) {
        existingItem.quantity += item.quantity;
      } else {
        state.items.push(item);
      }
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    removeFromCart: (state, action) => {
      const { product_id, variant_id } = action.payload;
      state.items = state.items.filter(
        (i) => !(i.product_id === product_id && i.variant_id === variant_id)
      );
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    updateQuantity: (state, action) => {
      const { product_id, variant_id, quantity } = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter(
          (i) => !(i.product_id === product_id && i.variant_id === variant_id)
        );
      } else {
        const existingItem = state.items.find(
          (i) => i.product_id === product_id && i.variant_id === variant_id
        );
        if (existingItem) {
          existingItem.quantity = quantity;
        }
      }
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem('cartItems');
    },
    setCart: (state, action) => {
      state.items = action.payload;
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    setDBCart: (state, action) => {
      state.items = action.payload;
      localStorage.removeItem('cartItems');
    },
  },

  // ─── Extra reducers cho Guest Cart API ───
  extraReducers: (builder) => {
    builder
      // fetchGuestCart
      .addCase(fetchGuestCart.pending, (state) => { state.guestStatus = 'loading'; })
      .addCase(fetchGuestCart.fulfilled, (state, action) => {
        state.guestStatus = 'idle';
        state.guestItems = action.payload || [];
      })
      .addCase(fetchGuestCart.rejected, (state) => { state.guestStatus = 'idle'; })

      // addToGuestCartAPI — sau khi thêm, component tự gọi fetchGuestCart
      .addCase(addToGuestCartAPI.fulfilled, (state) => { state.guestStatus = 'idle'; })

      // updateGuestCartAPI
      .addCase(updateGuestCartAPI.fulfilled, (state, action) => {
        const updated = action.payload;
        if (updated) {
          const idx = state.guestItems.findIndex(i => i._id === updated._id);
          if (idx !== -1) state.guestItems[idx] = updated;
        }
      })

      // removeGuestCartAPI
      .addCase(removeGuestCartAPI.fulfilled, (state, action) => {
        state.guestItems = state.guestItems.filter(i => i._id !== action.payload);
      })

      // clearGuestCartAPI
      .addCase(clearGuestCartAPI.fulfilled, (state) => {
        state.guestItems = [];
      });
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, setCart, setDBCart } = cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectGuestCartItems = (state) => state.cart.guestItems;

/** Số dòng sản phẩm khác nhau trong giỏ (distinct line items) — dùng cho badge icon header */
export const selectCartItemCount = (state) => state.cart.items.length;

/** Tổng quantity (cộng dồn số lượng mỗi dòng) — giữ lại nếu cần */
export const selectCartTotalQuantity = (state) =>
  state.cart.items.reduce((total, item) => total + item.quantity, 0);

export const selectGuestCartTotalQuantity = (state) =>
  state.cart.guestItems.reduce((total, item) => total + (item.quantity || 0), 0);
export const selectCartTotalPrice = (state) =>
  state.cart.items.reduce((total, item) => total + item.price * item.quantity, 0);

export default cartSlice.reducer;
