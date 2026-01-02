import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// API Configuration
export const API_CONFIG = {
  BASE_URL:
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:8787'
      : 'https://saleseq-coach-prod.tonyabdelmalak.workers.dev',
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
};