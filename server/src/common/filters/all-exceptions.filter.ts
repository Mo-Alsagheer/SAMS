import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // Log the EXACT reason things failed
    this.logger.error(
      `[FAILED] ${request.method} ${request.originalUrl} - Status: ${status}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    // Also log body/query for easier debugging, being careful not to log passwords
    const safeBody = { ...request.body };
    if (safeBody.password) safeBody.password = '[REDACTED]';
    this.logger.debug(`Request Body: ${JSON.stringify(safeBody)}`);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: message,
    });
  }
}
