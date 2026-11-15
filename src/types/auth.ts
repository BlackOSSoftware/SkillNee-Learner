export interface UserRole {
  id: string;
  name: string;
  slug: string;
  permissions: string[];
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  profileImage?: string | null;
  roleId: string | null;
  role: UserRole | null;
  status: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLogin?: string | null;
  profile: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Backend returns tokens in the body AND sets HttpOnly cookies.
 * This app relies on the cookies — tokens are never stored in JS.
 */
export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ForgotPasswordResult {
  message: string;
  /** Present only outside production (dev convenience). */
  resetToken?: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

/** PUT /auth/me — only these fields are writable; email/phone are read-only. */
export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  /** New profile photo — uploaded to Cloudinary by the backend. */
  photo?: File | null;
  /** Remove the current profile photo. */
  removePhoto?: boolean;
}
