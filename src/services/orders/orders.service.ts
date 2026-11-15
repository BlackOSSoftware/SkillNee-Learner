import { apiClient } from '@/lib/api-client';
import type { ApiEnvelope } from '@/types/api';
import type { Order } from '@/types/commerce';

export interface OrdersListResponse {
  orders: Order[];
}

export async function listOrders(): Promise<Order[]> {
  const res = await apiClient.get<ApiEnvelope<OrdersListResponse>>('/student/orders');
  return res.data.data.orders;
}

export async function getOrder(id: string): Promise<Order> {
  const res = await apiClient.get<ApiEnvelope<{ order: Order }>>(
    `/student/orders/${encodeURIComponent(id)}`
  );
  return res.data.data.order;
}

export interface InvoiceDownload {
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

/** Downloads the order invoice PDF as a Blob using the authenticated session. */
export async function downloadInvoice(id: string, fallbackName: string): Promise<InvoiceDownload> {
  try {
    const res = await apiClient.get<Blob>(`/student/orders/${encodeURIComponent(id)}/invoice`, {
      responseType: 'blob',
      transformResponse: [(data) => data],
    });
    const blob = res.data instanceof Blob ? res.data : new Blob([res.data as BlobPart], { type: 'application/pdf' });
    if (blob.size === 0) {
      throw new Error('The invoice PDF is empty.');
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
    const axiosErr = err as {
      response?: { status?: number; data?: unknown };
      message?: string;
    };
    if (axiosErr.response?.data instanceof Blob) {
      try {
        const text = await axiosErr.response.data.text();
        const parsed = JSON.parse(text) as { error?: { message?: string } };
        throw new Error(parsed?.error?.message || 'Invoice download failed. Please try again.');
      } catch (parseErr) {
        if (parseErr instanceof Error && parseErr.message !== 'Invoice download failed. Please try again.') {
          throw parseErr;
        }
        throw new Error('Invoice download failed. Please try again.');
      }
    }
    if (axiosErr.response?.status === 401) {
      throw new Error('Your session has expired. Please sign in again.');
    }
    if (axiosErr.response?.status === 403) {
      throw new Error('You are not allowed to download this invoice.');
    }
    if (axiosErr.response?.status === 404) {
      throw new Error('Invoice not available for this order.');
    }
    throw new Error(axiosErr.message || 'Invoice download failed. Please try again.');
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
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
