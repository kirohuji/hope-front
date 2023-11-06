import { createSlice } from '@reduxjs/toolkit';
import _ from 'lodash'
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
    index: -1
};

const slice = createSlice({
    name: 'trainning',
    initialState,
    reducers: {
        next (state) {
            if (state.index + 1 > state.list.length) {
                state.index = -1;
            }
            state.index += 1
            state.current = state.list[state.index];
        },
        play (state, action) {
            state.current = action.payload;
            state.index = _.findIndex(state.list, ["_id", state.current._id])
        },
        setCurrent (state, action) {
            state.current = action.payload;
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
        getPlaySuccess (state, action) {
            state.isLoading = false;
            const { book, article, list } = action.payload;
            state.book = book;
            state.article = article;
            state.list = list;
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

export function next () {
    return async (dispatch) => {
        try {
            dispatch(slice.actions.next());
        } catch (error) {
            console.error(error);
            dispatch(slice.actions.hasError(error));
        }
    };
}

export function select (item) {
    return async (dispatch) => {
        try {
            dispatch(slice.actions.play(item));
        } catch (error) {
            console.error(error);
            dispatch(slice.actions.hasError(error));
        }
    };
}

export function getPlay () {
    return async (dispatch) => {
        dispatch(slice.actions.startLoading());
        try {
            const response = await bookService.getPlayWithCurrentUser();
            dispatch(slice.actions.getPlaySuccess(response));
        } catch (error) {
            dispatch(slice.actions.hasError(error));
        }
    };
}