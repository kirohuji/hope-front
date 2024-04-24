import { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter,BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import * as serviceWorker from './serviceWorker';
//
import App from './App';

// ----------------------------------------------------------------------

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <HelmetProvider>
    <HashRouter>
      <Suspense>
        <App />
      </Suspense>
    </HashRouter>
  </HelmetProvider>
);

serviceWorker.unregister();
