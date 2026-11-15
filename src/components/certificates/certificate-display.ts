import type { CertificateStatus } from '@/types/certificates';

export function formatCertificateDate(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function certificateStatusLabel(status: CertificateStatus): string {
  switch (status) {
    case 'issued':
      return 'Issued';
    case 'revoked':
      return 'Revoked';
    case 'expired':
      return 'Expired';
    default:
      return status;
  }
}

export function certificateFileName(cert: { certificateNumber: string; studentName?: string; courseName?: string }): string {
  const safe = (s: string) => s.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '');
  const num = safe(cert.certificateNumber) || 'certificate';
  return `${num}.pdf`;
}
