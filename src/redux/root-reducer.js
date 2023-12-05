import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
// slices
import checkoutReducer from './slices/checkout';
import scopeReducer from './slices/scope';
import dashboardReducer from './slices/dashboard';
import calendarReducer from './slices/calendar';
import articleReducer from './slices/article';
import chatReducer from './slices/chat';
import audioReducer from './slices/audio';
import trainningReducer from './slices/trainning';
import roleReducer from './slices/role';
// import notificationReducer from './slices/notification';
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

export const rolePersistConfig = {
  key: 'role',
  storage,
  keyPrefix: 'redux-'
};

export const articlePersistConfig = {
  key: 'article',
  storage,
  keyPrefix: 'redux-',
  whitelist: ['sortBy', 'checkout'],
};

export const rootReducer = combineReducers({
  calendar: calendarReducer,
  chat: chatReducer,
  audio: audioReducer,
  trainning: trainningReducer,
  // notification: notificationReducer,
  dashboard: persistReducer(dashboardPersistConfig, dashboardReducer),
  role: persistReducer(rolePersistConfig, roleReducer),
  checkout: persistReducer(checkoutPersistConfig, checkoutReducer),
  scope: persistReducer(scopePersistConfig, scopeReducer),
  article: persistReducer(articlePersistConfig, articleReducer),
  book: persistReducer(bookPersistConfig, scopeReducer),
});
