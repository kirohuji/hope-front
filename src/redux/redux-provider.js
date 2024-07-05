import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';
//
import { store, persistor } from './store';

// ----------------------------------------------------------------------

export default function ReduxProvider({ children }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}

ReduxProvider.propTypes = {
  children: PropTypes.node,
};
