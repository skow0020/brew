import { useQuery } from '@tanstack/react-query'
import { getSiteContent } from '../lib/api/contentApi'
import { queryKeys } from '../lib/content/queryKeys'

export function useSiteContent() {
  return useQuery({
    queryKey: queryKeys.siteContent,
    queryFn: getSiteContent,
    staleTime: 1000 * 60 * 5,
  })
}
