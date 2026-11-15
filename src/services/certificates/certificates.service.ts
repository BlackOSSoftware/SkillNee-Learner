import { apiClient } from '@/lib/api-client';
import type { ApiEnvelope } from '@/types/api';
import type { StudentCertificate, StudentCertificatesResponse } from '@/types/certificates';

export async function listCertificates(): Promise<StudentCertificate[]> {
  const res = await apiClient.get<ApiEnvelope<StudentCertificatesResponse>>('/student/certificates');
  return res.data.data.certificates;
}

export async function getCertificate(id: string): Promise<StudentCertificate> {
  const res = await apiClient.get<ApiEnvelope<{ certificate: StudentCertificate }>>(
    `/student/certificates/${encodeURIComponent(id)}`
  );
  return res.data.data.certificate;
}

export interface CertificateDownload {
  blob: Blob;
  fileName: string;
}

function filenameFromDisposition(disposition: string | undefined, fallback: string): string {
  if (!disposition) return fallback;
  const match = /filename\*?=(?:UTF-8''|")?([^";]+)"?/i.exec(disposition);
  if (match?.[1]) {
    try {
      return decodeURIComponent(match[1].replace(/"/g, ''));
    } catch {
      return match[1].replace(/"/g, '');
    }
  }
  return fallback;
}

/**
 * Downloads the certificate PDF as a Blob using the authenticated session.
 * Throws a descriptive Error on failure (including non-2xx blob error bodies).
 */
export async function downloadCertificate(id: string, fallbackName: string): Promise<CertificateDownload> {
  try {
    const res = await apiClient.get<Blob>(`/student/certificates/${encodeURIComponent(id)}/download`, {
      responseType: 'blob',
      // Do not let axios try to JSON-parse the PDF.
      transformResponse: [(data) => data],
    });
    const blob = res.data instanceof Blob ? res.data : new Blob([res.data as BlobPart], { type: 'application/pdf' });
    // Guard against empty / non-PDF responses.
    if (blob.size === 0) {
      throw new Error('The certificate PDF is empty.');
    }
    const type = (blob.type || '').toLowerCase();
    if (type && !type.includes('pdf') && !type.includes('octet-stream')) {
      throw new Error('The server did not return a PDF file.');
    }
    const fileName = filenameFromDisposition(
      res.headers?.['content-disposition'] as string | undefined,
      fallbackName
    );
    return { blob, fileName };
  } catch (err) {
    // Axios blob errors carry the error body as a Blob — surface its message.
    const axiosErr = err as {
      response?: { status?: number; data?: unknown; headers?: Record<string, string> };
      message?: string;
    };
    if (axiosErr.response?.data instanceof Blob) {
      try {
        const text = await axiosErr.response.data.text();
        const parsed = JSON.parse(text) as { error?: { message?: string } };
        throw new Error(parsed?.error?.message || 'Download failed. Please try again.');
      } catch (parseErr) {
        if (parseErr instanceof Error && parseErr.message !== 'Download failed. Please try again.') {
          throw parseErr;
        }
        throw new Error('Download failed. Please try again.');
      }
    }
    if (axiosErr.response?.status === 401) {
      throw new Error('Your session has expired. Please sign in again.');
    }
    if (axiosErr.response?.status === 403) {
      throw new Error('You are not allowed to download this certificate.');
    }
    if (axiosErr.response?.status === 404) {
      throw new Error('Certificate not found.');
    }
    throw new Error(axiosErr.message || 'Download failed. Please try again.');
  }
}

/** Triggers a browser download for an already-fetched PDF blob. */
export function saveBlobAs(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke after a tick so the click has time to start.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
