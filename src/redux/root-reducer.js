import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
// slices
import checkoutReducer from './slices/checkout';
import scopeReducer from './slices/scope';
import dashboardReducer from './slices/dashboard';
import calendarReducer from './slices/calendar';
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

export const bookPersistConfig = {
  key: 'book',
  storage,
  keyPrefix: 'redux-'
};

export const dashboardPersistConfig = {
  key: 'dashboard',
  storage,
  keyPrefix: 'redux-'
};

export const rootReducer = combineReducers({
  calendar: calendarReducer,
  dashboard: persistReducer(dashboardPersistConfig, dashboardReducer),
  checkout: persistReducer(checkoutPersistConfig, checkoutReducer),
  scope: persistReducer(scopePersistConfig, scopeReducer),
  book: persistReducer(bookPersistConfig, scopeReducer),
});
