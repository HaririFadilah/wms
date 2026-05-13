// Shared API envelope shape — matches `ResponseInterceptor` + `AllExceptionsFilter`
// from unms-backend. Frontend SHOULD type all responses as ApiResponse<T> and
// unwrap to `T` inside the axios interceptor (see src/lib/api.ts).

export interface ApiMeta {
  requestId?: string;
  page?: number;
  limit?: number;
  total?: number;
  [key: string]: unknown;
}

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
  meta: ApiMeta;
}

export interface ApiError {
  success: false;
  message: string;
  code?: string;
  errors?: unknown;
  meta: ApiMeta;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

/**
 * Auth profile returned by `GET /auth/me` and inside `POST /auth/login`.
 * Mirrors unms-backend src/modules/auth/auth.types.ts:UserProfile.
 */
export interface AuthUser {
  id: string;
  email: string;
  username: string;
  fullName: string;
  status: 'active' | 'inactive' | 'suspended';
  roles: string[];
  permissions: string[];
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: AuthUser;
}
