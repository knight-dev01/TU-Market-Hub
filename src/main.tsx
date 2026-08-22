import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
// TypeScript may not have a declaration for CSS side-effect imports in this setup.
// @ts-expect-error CSS is handled by the bundler at runtime.
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
