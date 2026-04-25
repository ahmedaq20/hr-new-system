import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from './lib/react-query'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
    <Toaster position="top-center" reverseOrder={false} toastOptions={{ style: { direction: 'rtl' } }} />
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
)
