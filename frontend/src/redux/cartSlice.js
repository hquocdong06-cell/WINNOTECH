import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Nếu có API, sau này ta có thể dùng createAsyncThunk để call API backend
// Export async thunks cho DB (nếu cần dùng sau này)
const initialState = {
  items: JSON.parse(localStorage.getItem('cartItems')) || [],
  status: 'idle',
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
      const existingItem = state.items.find(
        (i) => i.product_id === product_id && i.variant_id === variant_id
      );
      if (existingItem && quantity > 0) {
        existingItem.quantity = quantity;
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
    }
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, setCart } = cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;
export const selectCartTotalQuantity = (state) =>
  state.cart.items.reduce((total, item) => total + item.quantity, 0);
export const selectCartTotalPrice = (state) =>
  state.cart.items.reduce((total, item) => total + item.price * item.quantity, 0);

export default cartSlice.reducer;
