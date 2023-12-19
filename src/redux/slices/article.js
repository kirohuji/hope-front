import sum from 'lodash/sum';
import uniq from 'lodash/uniq';
import uniqBy from 'lodash/uniqBy';
import { createSlice } from '@reduxjs/toolkit';
// utils
import { articleService } from '../../composables/context-provider';
// ----------------------------------------------------------------------

const initialState = {
  isLoading: true,
  error: null,
  data: [],
  article: null,
  activeStep: 0,
};

const slice = createSlice({
  name: 'article',
  initialState,
  reducers: {
    setArticle(state, action){
      state.article = action.payload;
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
    getArticlesSuccess (state, action) {
      state.isLoading = false;
      state.article = action.payload;
    },

    getDataSuccess (state, action) {
      state.isLoading = false;
      state.data = action.payload;
    },

    backStep(state) {
      state.activeStep -= 1;
    },

    nextStep(state) {
      state.activeStep += 1;
    },

    gotoStep(state, action) {
      const step = action.payload;
      state.activeStep = step;
    },

  },
});

// Reducer
export default slice.reducer;

// Actions
export const {
  setArticle,
  nextStep,
  backStep
} = slice.actions;

// ----------------------------------------------------------------------

export function getArticle (id) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await articleService.get({
        _id: id,
      })
      dispatch(slice.actions.getArticlesSuccess(response));
    } catch (error) {
      console.error(error);
      dispatch(slice.actions.hasError(error));
    }
  };
}
export function getDatas (query) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try{
      const response = await articleService.pagination(query);
      dispatch(slice.actions.getDataSuccess(response.data));
    } catch(error){
      dispatch(slice.actions.hasError(error));
    }
  };
}