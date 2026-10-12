"use client";

import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import {
  persister,
  QUERY_CACHE_BUSTER,
  QUERY_CACHE_MAX_AGE_MS,
  queryClient
} from "../queryClient";

export default function QueryClientProviderApp({ children }: any) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: QUERY_CACHE_MAX_AGE_MS,
        buster: QUERY_CACHE_BUSTER
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
