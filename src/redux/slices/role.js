import { createSlice } from '@reduxjs/toolkit';
// utils
import { roleService } from '../../composables/context-provider';
// ----------------------------------------------------------------------

const initialState = {
  isLoading: true,
  error: {
    code: 0,
    message: '',
  },
  organizations: {},
  role: {},
  permissions: [],
};

const slice = createSlice({
  name: 'role',
  initialState,
  reducers: {
    setActive(state, action) {
      state.active = action.payload;
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

    getOrganizationsSuccess(state, action) {
      state.isLoading = false;
      state.organizations = action.payload;
    },

    getPermissionsSuccess(state, action) {
      state.isLoading = false;
      state.permissions = action.payload;
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { setActive } = slice.actions;

// ----------------------------------------------------------------------

export function getOrganizations(query) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await roleService.getRolesTreeByCurrentUser(query);
      dispatch(slice.actions.getOrganizationsSuccess(response));
    } catch (error) {
      // console.error(error);
      dispatch(
        slice.actions.hasError({
          code: error.code,
          message: error.message,
        })
      );
    }
  };
}

export function getPermissions(query) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await roleService.permissions(query);
      dispatch(slice.actions.getPermissionsSuccess(response));
    } catch (error) {
      // console.error(error);
      dispatch(
        slice.actions.hasError({
          code: error.code,
          message: error.message,
        })
      );
    }
  };
}
