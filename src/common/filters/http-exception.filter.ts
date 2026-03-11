import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
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

    // Log siempre el error real en consola para debugging
    if (!(exception instanceof HttpException)) {
      console.error('[500 ERROR]', exception);
    }

    const errorResponse = {
      statusCode: status,
      message:
        typeof message === 'object' && 'message' in (message as object)
          ? (message as any).message
          : message,
      // En desarrollo, incluir el mensaje real del error para debugging
      detail: !(exception instanceof HttpException) && exception instanceof Error
        ? exception.message
        : undefined,
      error:
        typeof message === 'object' && 'error' in (message as object)
          ? (message as any).error
          : undefined,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }
}
