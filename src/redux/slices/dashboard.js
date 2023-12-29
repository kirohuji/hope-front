import { createSlice } from '@reduxjs/toolkit';
// ----------------------------------------------------------------------

const initialState = {
  bottomNavigationActionValue: 0
};

const slice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    updateBottomNavigationActionValueSuccess(state, action) {
      if (state.bottomNavigationActionValue !== action.payload) {
        state.bottomNavigationActionValue = action.payload;
      }
    }
  }
})

// Reducer
export default slice.reducer;

export function updateBottomNavigationActionValue(value) {
  return async (dispatch) => {
    dispatch(slice.actions.updateBottomNavigationActionValueSuccess(value));
  };
}