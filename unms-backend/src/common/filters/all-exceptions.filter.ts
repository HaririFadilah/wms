import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ApiErrorBody {
  success: false;
  message: string;
  code: string;
  errors?: Array<{ field?: string; message: string }>;
  meta: { requestId: string };
}

interface HttpExceptionResponseShape {
  message?: string | string[];
  error?: string;
  code?: string;
  errors?: Array<{ field?: string; message: string }>;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = request.requestId ?? '';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';
    let errors: ApiErrorBody['errors'];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (res && typeof res === 'object') {
        const r = res as HttpExceptionResponseShape;
        const rawMessage = r.message ?? exception.message;
        message = Array.isArray(rawMessage) ? rawMessage.join('; ') : rawMessage;
        code = r.code ?? this.statusToCode(status);
        if (Array.isArray(rawMessage) && !r.errors) {
          errors = rawMessage.map((m) => ({ message: m }));
        } else if (r.errors) {
          errors = r.errors;
        }
      }
    } else if (exception instanceof Error) {
      message = process.env.NODE_ENV === 'production' ? 'Internal server error' : exception.message;
      this.logger.error(`[${requestId}] ${exception.message}`, exception.stack);
    }

    const body: ApiErrorBody = {
      success: false,
      message,
      code,
      ...(errors ? { errors } : {}),
      meta: { requestId },
    };

    response.status(status).json(body);
  }

  private statusToCode(status: number): string {
    const map: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'VALIDATION_ERROR',
      429: 'RATE_LIMITED',
    };
    return map[status] ?? 'INTERNAL_ERROR';
  }
}
