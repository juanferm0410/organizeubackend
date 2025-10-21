import {ExceptionFilter,Catch,ArgumentsHost,HttpException,HttpStatus,Logger,} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch() // Captura todas las excepciones
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: any;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'string' ? { message: res } : (res as object);
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = { message: 'Internal server error' };
    }

    // Log del error (útil para desarrollo)
    this.logger.error(
      `Status: ${status} | Path: ${request.url} | Error: ${JSON.stringify(message)}`
      //(exception as any).stack, // Da el mensaje de error completo
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...message,
    });
  }
}
