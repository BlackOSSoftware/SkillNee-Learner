export type CertificateStatus = 'issued' | 'revoked' | 'expired';
export type CertificateIssueSource = 'manual' | 'automatic' | 'regenerate';

export interface StudentCertificate {
  id: string;
  certificateNumber: string;
  studentId: string;
  courseId: string;
  enrollmentId: string;
  certificateTemplateId: string | null;
  studentName: string;
  courseName: string;
  organizationName: string;
  completionDate: string;
  issueDate: string;
  verificationUrl: string;
  certificateStatus: CertificateStatus;
  issueSource: CertificateIssueSource;
  revokedAt: string | null;
  revocationReason: string | null;
  replacesCertificateId: string | null;
  replacedByCertificateId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StudentCertificatesResponse {
  certificates: StudentCertificate[];
}
