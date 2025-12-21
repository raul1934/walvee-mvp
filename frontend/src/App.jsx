import "./App.css";
import Pages from "@/pages/index.jsx";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NotificationProvider } from "@/contexts/NotificationContext";

// Read Vite env vars (prefixed with VITE_)
const isDev = import.meta.env.MODE === "development";
const staleEnv = import.meta.env.VITE_REACT_QUERY_STALE_TIME;
const retryEnv = import.meta.env.VITE_REACT_QUERY_RETRY;

// Defaults
let staleTimeDefault = 5 * 60 * 1000; // 5 minutes
let retryDefault = 1;

if (isDev) {
  // In development, prefer env vars, otherwise use strict dev defaults
  staleTimeDefault = staleEnv !== undefined ? parseInt(staleEnv, 10) || 0 : 0;

  if (retryEnv !== undefined) {
    const rLower = String(retryEnv).toLowerCase();
    if (rLower === "infinite" || retryEnv === "Infinity") {
      retryDefault = Infinity;
    } else {
      const parsed = parseInt(retryEnv, 10);
      retryDefault = isNaN(parsed) ? Infinity : parsed;
    }
  } else {
    retryDefault = Infinity;
  }
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: retryDefault,
      staleTime: staleTimeDefault,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <Pages />
        <Toaster />
      </NotificationProvider>
    </QueryClientProvider>
  );
}

export default App;
