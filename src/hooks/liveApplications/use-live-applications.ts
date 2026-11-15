'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listMyLiveApplications,
  submitLiveApplication,
} from '@/services/liveApplications/liveApplications.service';
import { queryKeys } from '@/lib/query-keys';
import type { SubmitLiveApplicationInput } from '@/types/liveApplications';

export function useSubmitLiveApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SubmitLiveApplicationInput) => submitLiveApplication(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.liveApplications.mine });
    },
  });
}

export function useMyLiveApplications(enabled = true) {
  return useQuery({
    queryKey: queryKeys.liveApplications.mine,
    queryFn: listMyLiveApplications,
    enabled,
    staleTime: 30_000,
  });
}
