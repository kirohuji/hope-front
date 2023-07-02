import { createSlice } from '@reduxjs/toolkit';
// utils
import { scopeService } from '../../composables/context-provider';
// ----------------------------------------------------------------------

const initialState = {
  active: null,
};

const slice = createSlice({
  name: 'book',
  initialState,
  reducers: {
    setActive(state, action){
      state.active = action.payload;
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const {
    setActive
} = slice.actions;

// ----------------------------------------------------------------------
