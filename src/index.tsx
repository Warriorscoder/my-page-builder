import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SDKProvider } from '@contentful/react-apps-toolkit';
import { GlobalStyles } from '@contentful/f36-components';

import { store, persistor } from './redux/store';
import App from './App';
import './index.css';

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <SDKProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <GlobalStyles />
          <App />
        </PersistGate>
      </Provider>
    </SDKProvider>
  </React.StrictMode>
);