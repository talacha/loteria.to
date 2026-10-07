import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import { Landing } from './Landing';
import './landing.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Landing />
    <Analytics />
  </StrictMode>,
);
