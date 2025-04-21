import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { AppDefaultRouterProvider } from '@/providers/AppDefaultRouterProvider';
import { TanStackQueryProvider } from './providers/TanStackQueryProvider';





createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <TanStackQueryProvider>
            <AppDefaultRouterProvider/>
        </TanStackQueryProvider>
    </StrictMode>,
);
