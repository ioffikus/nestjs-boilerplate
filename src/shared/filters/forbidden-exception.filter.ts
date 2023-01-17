import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Catch, ForbiddenException } from '@nestjs/common';
import Cookies from 'cookies';
import type { Request, Response } from 'express';
import { ConfigService } from 'src/shared/services/config.service';

import { ERROR_CODES } from '../constants/error-codes';
import type { ErrorResponse } from '../error-response';

const configService = new ConfigService();

@Catch(ForbiddenException)
export class ForbiddenExceptionFilter implements ExceptionFilter {
  catch(exception: ForbiddenException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const { url } = request;

    const cookies = Cookies(request, response as any);

    cookies.set(configService.accessTokenCookieName, null, {
      httpOnly: true,
      maxAge: 0,
      overwrite: true,
      domain: configService.getCookieDomain(),
    });

    const errorResponse: ErrorResponse = {
      url,
      timestamp: new Date().toISOString(),
      messages: [ERROR_CODES.NO_ACCESS],
    };

    response.status(403).json(errorResponse);
  }
}
