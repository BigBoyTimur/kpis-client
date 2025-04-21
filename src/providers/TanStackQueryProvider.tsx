import { QueryClient } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export const TanStackQueryProvider = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
        { children }
    </QueryClientProvider>
);