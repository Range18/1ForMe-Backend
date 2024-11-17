import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiException } from './api-exception';
import { Response } from 'express';
import { ExceptionResponse } from '#src/common/exception-handler/exception-response.type';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    let statusCode: number;
    let message: string;
    let description: string | object;

    if (exception instanceof ApiException) {
      statusCode = exception.status;
      message = exception.message;
      description = exception.description;
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      description = exception.getResponse();
      message = this.getFormatedHttpExceptionMessage(exception);
    } else {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'INTERNAL_SERVER_ERROR';
    }

    if (statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
      Logger.error(exception);
    }

    response.status(statusCode).json({
      success: false,
      statusCode: statusCode,
      type: exception instanceof ApiException ? exception.type : undefined,
      message: message,
      description: description,
      output:
        statusCode === HttpStatus.INTERNAL_SERVER_ERROR ? exception : undefined,
    } as ExceptionResponse);
  }

  private getFormatedHttpExceptionMessage(exception: HttpException): string {
    if (
      exception.getResponse() &&
      typeof exception.getResponse() === 'object'
    ) {
      const responseMessage = (<{ message: string[] | string }>(
        exception.getResponse()
      )).message;

      return Array.isArray(responseMessage)
        ? responseMessage.join(', ')
        : responseMessage;
    }

    return exception.message;
  }
}
