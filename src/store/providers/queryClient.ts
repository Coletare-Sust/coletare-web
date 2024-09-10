"use client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient } from "@tanstack/react-query";

const cacheTime = 1000 * 60 * 60 * 24 * 5; // 5 dias

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime
    }
  }
});

export const persister = createSyncStoragePersister({
  storage: typeof window !== "undefined" ? window.localStorage : undefined
});
