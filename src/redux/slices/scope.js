import { createSlice } from '@reduxjs/toolkit';
// utils
import { scopeService } from '../../composables/context-provider';
// ----------------------------------------------------------------------

const initialState = {
  isLoading: true,
  error: null,
  scopes: [],
  active: null,
};

const slice = createSlice({
  name: 'scope',
  initialState,
  reducers: {
    setActive(state, action){
      state.active = action.payload;
    },
    // START LOADING
    startLoading (state) {
      state.isLoading = true;
    },

    // HAS ERROR
    hasError (state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    // GET POSTS
    getScopesSuccess (state, action) {
      state.isLoading = false;
      state.scopes = action.payload;
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

export function getScope (id) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await scopeService.getPost({
        _id: id,
      })
      dispatch(slice.actions.getPostsSuccess(response));
    } catch (error) {
      console.error(error);
      dispatch(slice.actions.hasError(error));
    }
  };
}
export function getScopes () {
    return async (dispatch) => {
      dispatch(slice.actions.startLoading());
      try {
        const response = await scopeService.getAll()
        dispatch(slice.actions.getScopesSuccess(response));
        dispatch(slice.actions.setActive(response[0]));
      } catch (error) {
        console.error(error);
        dispatch(slice.actions.hasError(error));
      }
    };
  }