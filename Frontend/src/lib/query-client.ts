import { QueryClient } from "@tanstack/react-query"

import {
  RESULT_QUERY_OPTIONS,
  shouldRetryResultQuery,
} from "@/queries/result/result-query-options"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetryResultQuery,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      ...RESULT_QUERY_OPTIONS,
    },
    mutations: {
      retry: 0,
    },
  },
})
