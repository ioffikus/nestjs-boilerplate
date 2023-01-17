import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Catch } from '@nestjs/common';
import type { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

import { ERROR_CODES } from '../constants/error-codes';
import type { ErrorResponse } from '../error-response';

@Catch(QueryFailedError)
export class QueryFailedExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const { url } = request;

    const errorResponse: ErrorResponse = {
      url,
      timestamp: new Date().toISOString(),
      messages: [
        {
          text: `${exception.toString()}. ${exception.detail}`,
          code: ERROR_CODES.PG.code,
          value: exception.parameters || null,
        },
      ],
    };

    response.status(500).json(errorResponse);
  }
}
