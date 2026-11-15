'use client';

import { useMutation } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
  downloadCertificate,
  getCertificate,
  listCertificates,
  saveBlobAs,
} from '@/services/certificates/certificates.service';

export function useCertificates(enabled = true) {
  return useQuery({
    queryKey: queryKeys.certificates.list,
    queryFn: listCertificates,
    enabled,
    staleTime: 60_000,
  });
}

export function useCertificate(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.certificates.detail(id ?? ''),
    queryFn: () => getCertificate(id as string),
    enabled: enabled && Boolean(id),
    staleTime: 60_000,
  });
}

export function useDownloadCertificate() {
  return useMutation({
    mutationFn: ({ id, fallbackName }: { id: string; fallbackName: string }) =>
      downloadCertificate(id, fallbackName),
    onSuccess: ({ blob, fileName }) => {
      saveBlobAs(blob, fileName);
    },
  });
}
