import { createSlice } from '@reduxjs/toolkit';
// utils
import _ from 'lodash';
import { roleService, scopeService } from '../../composables/context-provider';
// ----------------------------------------------------------------------

function serverArray (list, parent, data, permissions, maxRole) {
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < list.length; i++) {
    if (list[i] && list[i].value) {
      if (list[i] && list[i].children && _.compact(list[i].children).length) {
        serverArray(list[i].children.map(item => _.find(data, ["_id", item._id])), list[i], data, permissions, maxRole);
      } else {
        list[i].children = undefined;
      }
      if (parent && parent.children) {
        if (list[i]) {
          parent.children[i] = {
            name: list[i].label,
            group: list[i].scope,
            role: list[i].value,
            isMaxRole: maxRole._id === list[i]._id,
            disabled: permissions.indexOf(list[i]._id) === -1,
            ...list[i],
          };
        } else {
          delete parent.children[i];
        }
      }
    }
  }
}
function getTree (data, maxRole) {
  const permissions = maxRole && maxRole.children ? maxRole.children.map(item => item._id) : [];
  const list = data.map(item => ({
    name: item.label,
    group: item.scope,
    role: item.value,
    ...item
  }))
  const root = list.filter((item) => item.isScope).map(item => ({
    name: item.label,
    group: item.scope,
    role: item.value,
    ...item,
    children: list.filter(d => d.root && !d.isScope)
  }))
  serverArray(root, null, list, permissions, maxRole);
  return root;
}


const initialState = {
  isLoading: true,
  error: null,
  scopes: [],
  active: null,
  organizations: [],
  maxRole: {},
  roles: {},
};

const slice = createSlice({
  name: 'scope',
  initialState,
  reducers: {
    setActive (state, action) {
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

    // GET Scopes
    getScopesSuccess (state, action) {
      state.isLoading = false;
      state.scopes = action.payload;
    },
    // GET Organizations
    getOrganizationsSuccess (state, action) {
      const { tree, getMaxRoleData } = action.payload;
      state.organizations = tree;
      state.maxRole = getMaxRoleData;
      state.isLoading = false;
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
export function getOrganizations (type) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.startLoading());
    const { active } = getState().scope;
    try {
      const getRoleWithData = await roleService.getRoleWith({
        selector: {
          scope: active._id,
          type
        },
      });
      const getMaxRoleData = await roleService.getMaxRole({
        roles: getRoleWithData.map(item => item._id)
      })
      getRoleWithData.push({
        root: true,
        _id: active._id,
        scope: active.id,
        value: active.value,
        label: active.label,
        role: active.value,
        isScope: true,
        children: [],
      });
      const tree = getTree(getRoleWithData, getMaxRoleData)
      console.log('tree',tree)
      dispatch(slice.actions.getOrganizationsSuccess({ tree, getMaxRoleData }));
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