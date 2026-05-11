import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();
    const started = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const ms = Date.now() - started;
          this.logger.log(
            `[${req.requestId ?? '-'}] ${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`,
          );
        },
        error: (err: Error) => {
          const ms = Date.now() - started;
          this.logger.warn(
            `[${req.requestId ?? '-'}] ${req.method} ${req.originalUrl} ERR ${ms}ms - ${err.message}`,
          );
        },
      }),
    );
  }
}
