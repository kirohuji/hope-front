import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
// slices
import checkoutReducer from './slices/checkout';
import scopeReducer from './slices/scope';
// ----------------------------------------------------------------------

const checkoutPersistConfig = {
  key: 'checkout',
  storage,
  keyPrefix: 'redux-',
};

export const scopePersistConfig = {
  key: 'scope',
  storage,
  keyPrefix: 'redux-'
};


export const rootReducer = combineReducers({
  checkout: persistReducer(checkoutPersistConfig, checkoutReducer),
  scope: persistReducer(scopePersistConfig, scopeReducer),
});
