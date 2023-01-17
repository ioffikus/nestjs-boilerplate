import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { BadRequestException, Catch } from '@nestjs/common';
import type { Request, Response } from 'express';
import { isArray } from 'lodash';

import { ERROR_CODES } from '../constants/error-codes';
import type { ErrorMessage, ErrorResponse } from '../error-response';

@Catch(BadRequestException)
export class BadRequestExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const result: any = exception.getResponse();
    const { url } = request;

    let messages: ErrorMessage[] = [];

    if (result.message) {
      if (isArray(result.message)) {
        for (const item of result.message) {
          messages.push({
            code: ERROR_CODES.VALIDATION.code,
            text: item.toString(),
            ...item,
          });
        }
      }
    } else if (result.messages) {
      // eslint-disable-next-line unicorn/prefer-spread
      messages = messages.concat(result.messages);
    } else {
      messages.push({
        text: result.message,
        code: ERROR_CODES.UNKNOWN.code,
      });
    }

    const errorResponse: ErrorResponse = {
      url,
      timestamp: new Date().toISOString(),
      messages,
    };

    response.status(400).json(errorResponse);
  }
}
