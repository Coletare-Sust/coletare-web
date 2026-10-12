"use client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient } from "@tanstack/react-query";

// O cache é persistido no localStorage (inclui dados pessoais como CPF e e-mail), então
// guardamos no máximo 1 dia e descartamos tudo a cada build (buster) e no logout.
export const QUERY_CACHE_MAX_AGE_MS = 1000 * 60 * 60 * 24; // 1 dia
export const QUERY_CACHE_BUSTER = process.env.NEXT_PUBLIC_BUILD_ID ?? "dev";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // cacheTime precisa ser >= maxAge da persistência, senão a restauração descarta tudo.
      cacheTime: QUERY_CACHE_MAX_AGE_MS
    }
  }
});

export const persister = createSyncStoragePersister({
  storage: typeof window !== "undefined" ? window.localStorage : undefined
});

/** Limpa o cache em memória e o persistido (logout ou sessão expirada). */
export const clearQueryCache = () => {
  queryClient.clear();
  persister.removeClient();
};
