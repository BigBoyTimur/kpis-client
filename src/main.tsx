import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { AppDefaultRouterProvider } from '@/providers/AppDefaultRouterProvider';





createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AppDefaultRouterProvider/>
    </StrictMode>,
);
