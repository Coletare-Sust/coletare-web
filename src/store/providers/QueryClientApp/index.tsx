"use client";

import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { useState } from "react";
import { persister, queryClient } from "../queryClient";

export default function QueryClientProviderApp({ children }: any) {
  // const [client] = useState(
  //   new QueryClient({ defaultOptions: { queries: { staleTime: 5000 } } })
  // );
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
