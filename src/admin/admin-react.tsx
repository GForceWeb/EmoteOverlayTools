import React from 'react';
import { createRoot } from 'react-dom/client';
import AdminApp from './components/AdminApp';

// Mount the React application
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<AdminApp />);
}