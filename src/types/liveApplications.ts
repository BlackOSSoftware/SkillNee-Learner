/** Live course application types — mirror backend live-course-applications API. */

export type LiveApplicationStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'CONTACTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'CONVERTED';

export interface LiveCourseApplication {
  id: string;
  applicationReference: string;
  student?: string | null;
  name: string;
  email: string;
  whatsappNumber: string;
  currentCompany: string;
  currentCity: string;
  courseInterested: string;
  liveCourse: string;
  referralSource: string;
  comment?: string;
  status: LiveApplicationStatus;
  adminRemarks?: string;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  convertedEnrollment?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubmitLiveApplicationInput {
  name: string;
  email: string;
  whatsappNumber: string;
  currentCompany: string;
  currentCity: string;
  courseInterested: string;
  liveCourse: string;
  referralSource: string;
  comment?: string;
}

export const LIVE_COURSE_INTERESTS = [
  'DevOps',
  'Computerized System Validation Course',
  'Basic End User LIMS application course',
  'Advance Adminstrative LIMS application course',
  'Pharmacovigilance Diploma & Certification Courses',
  'Sterile Manufacturing',
  'Clinical Data Management Diploma & Certification Courses',
  'Medical writing Course',
  'Integrated industrial course of PV, CR, CDMS & DRA',
  'Drug Regulatory Affairs Certification',
  'Pharmaceuticals Engineering Course',
  'Pharmaceuticals Validation Course',
  'Pharmaceuticals Quality Assurance and validation Professuonal Course',
  'Manufacturing Execuation System Course',
  'SAP S4 HANA',
  'Pharmaceuticals GMP proffesional course',
  'Manufacturing Execuation Application Course',
  'Empower 3 Course',
  'Other Course (Mention in Comment Box)',
] as const;

export const LIVE_COURSE_REFERRAL_SOURCES = [
  'LinkedIn',
  'Website',
  'Referral',
  'Training Institute / Partner',
  'Google Search',
  'Friend / Colleague',
  'Existing Student / Alumni',
  'Company / Employer',
  'YouTube',
  'WhatsApp',
  'Advertisement',
  'Instagram',
  'Facebook',
  'Other',
] as const;
