import { createSlice } from '@reduxjs/toolkit';
import _ from 'lodash';
// utils
import { bookService } from 'src/composables/context-provider';

// ----------------------------------------------------------------------

const initialState = {
  isLoading: true,
  error: null,
  list: null,
  current: null,
  book: null,
  article: null,
  index: -1,
  selectedArticle: {},
  books: [],
  bookSummarize: {
    days: [],
  },
};

const slice = createSlice({
  name: 'trainning',
  initialState,
  reducers: {
    next(state) {
      if (state.index + 1 > state.list.length) {
        state.index = -1;
      }
      state.index += 1;
      state.current = state.list[state.index];
    },
    select(state, action) {
      state.current = action.payload;
      state.index = _.findIndex(state.list, ['_id', state.current._id]);
      state.selectedArticle = _.findIndex(state.list, ['_id', state.current._id]);
      state.article = _.find(state.list, ['_id', state.current._id]);
    },
    setCurrent(state, action) {
      state.current = action.payload;
    },
    updateBooksWithCurrentUserBySummarize(state, action) {
      state.bookSummarize = action.payload;
    },

    updateBooksWithCurrentUser(state, action) {
      state.books = action.payload;
    },
    // START LOADING
    startLoading(state) {
      state.isLoading = true;
    },

    // HAS ERROR
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    // GET POSTS
    getPlaySuccess(state, action) {
      state.isLoading = false;
      const { book, article, list } = action.payload;
      state.book = book;
      state.article = article;
      state.list = list;
    },
    getPlayFailure(state, action) {
      state.isLoading = false;
      state.book = null;
      state.article = null;
      state.list = null;
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { setArticle, nextStep, backStep } = slice.actions;

// ----------------------------------------------------------------------

export function next() {
  return async (dispatch) => {
    try {
      dispatch(slice.actions.next());
    } catch (error) {
      console.error(error);
      dispatch(
        slice.actions.hasError({
          code: error.code,
          message: error.message,
        })
      );
    }
  };
}

export function getBooksWithCurrentUser() {
  return async (dispatch) => {
    try {
      const booksData = await bookService.getBooksWithCurrentUser();
      dispatch(slice.actions.updateBooksWithCurrentUser(booksData));
    } catch (error) {
      console.error(error);
      dispatch(
        slice.actions.hasError({
          code: error.code,
          message: error.message,
        })
      );
    }
  };
}

export function getBooksWithCurrentUserBySummarize() {
  return async (dispatch, getState) => {
    try {
      const { books } = getState().trainning;
      const bookData = _.find(books, ['currentStatus', 'active']);
      if (bookData) {
        const bookSummarizeData = await bookService.getBooksWithCurrentUserBySummarize({
          bookId: bookData._id,
        });
        dispatch(slice.actions.updateBooksWithCurrentUserBySummarize(bookSummarizeData));
      }
    } catch (error) {
      console.error(error);
      dispatch(
        slice.actions.hasError({
          code: error.code,
          message: error.message,
        })
      );
    }
  };
}

export function select(item) {
  return async (dispatch, getState) => {
    try {
      console.log('getState()', getState());
      await bookService.select({
        book_id: getState().trainning.book._id,
        article_id: item._id,
      });
      dispatch(slice.actions.select(item));
    } catch (error) {
      dispatch(
        slice.actions.hasError({
          code: error.code,
          message: error.message,
        })
      );
    }
  };
}

export function getPlay() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await bookService.getPlayWithCurrentUser();
      dispatch(slice.actions.getPlaySuccess(response));
    } catch (error) {
      dispatch(slice.actions.getPlayFailure());
      dispatch(
        slice.actions.hasError({
          code: error.code,
          message: error.message,
        })
      );
    }
  };
}
