import { useQuery } from '@tanstack/react-query'
import { getTapList } from '../lib/api/tapListApi'
import { queryKeys } from '../lib/content/queryKeys'

export function useTapList() {
  return useQuery({
    queryKey: queryKeys.tapList,
    queryFn: getTapList,
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 60 * 2,
  })
}
