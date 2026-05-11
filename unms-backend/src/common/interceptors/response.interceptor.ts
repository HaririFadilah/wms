import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiMeta {
  requestId: string;
  page?: number;
  limit?: number;
  total?: number;
  [k: string]: unknown;
}

export interface ApiResponse<T> {
  success: true;
  message: string;
  data: T;
  meta: ApiMeta;
}

interface MaybeWrapped<T> {
  data?: T;
  message?: string;
  meta?: Partial<ApiMeta>;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T>> {
    const req = context.switchToHttp().getRequest<Request>();
    const requestId = req.requestId ?? '';

    return next.handle().pipe(
      map((payload): ApiResponse<T> => {
        if (payload !== null && typeof payload === 'object' && 'data' in (payload as object)) {
          const wrapped = payload as MaybeWrapped<T>;
          return {
            success: true,
            message: wrapped.message ?? 'OK',
            data: (wrapped.data as T) ?? (null as unknown as T),
            meta: { requestId, ...(wrapped.meta ?? {}) },
          };
        }

        return {
          success: true,
          message: 'OK',
          data: payload,
          meta: { requestId },
        };
      }),
    );
  }
}
