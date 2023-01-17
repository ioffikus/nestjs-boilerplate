import type { ValidationError } from '@nestjs/common';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { ExpressAdapter } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import * as useragent from 'express-useragent';
import * as morgan from 'morgan';
import { Logger } from 'nestjs-pino';
import {
  initializeTransactionalContext,
  patchTypeORMRepositoryWithBaseRepository,
} from 'typeorm-transactional-cls-hooked';

import { description, name, version } from './../package.json';
import { AppModule } from './app.module';
import { BadRequestExceptionFilter } from './shared/filters/bad-request-exception.filter';
import { ForbiddenExceptionFilter } from './shared/filters/forbidden-exception.filter';
import { QueryFailedExceptionFilter } from './shared/filters/query-failed-exception.filter';
import { UnauthorizedExceptionFilter } from './shared/filters/unauthorized-exception.filter';
import { ConfigService } from './shared/services/config.service';
import { SharedModule } from './shared/shared.module';

async function bootstrap() {
  const isDev = process.env.NODE_ENV === 'development';

  initializeTransactionalContext();
  patchTypeORMRepositoryWithBaseRepository();

  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(),
    {
      cors: true,
    },
  );

  const configService = app.select(SharedModule).get(ConfigService);

  app.enableShutdownHooks();

  app.useLogger(app.get(Logger));

  app.use(cookieParser());

  app.use(compression());

  if (isDev) {
    app.use(morgan('combined'));
  }

  app.use(useragent.express());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: false,
      dismissDefaultMessages: false,
      validationError: {
        target: true,
        value: true,
      },
      exceptionFactory: (errors: ValidationError[]) =>
        new BadRequestException(errors),
    }),
  );

  app.useGlobalFilters(
    new ForbiddenExceptionFilter(),
    new UnauthorizedExceptionFilter(),
    new QueryFailedExceptionFilter(),
    new BadRequestExceptionFilter(),
  );

  if (configService.isShowDocs) {
    const options = new DocumentBuilder()
      .setTitle(description)
      .setDescription(name)
      .setVersion(version)
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, options);

    SwaggerModule.setup('swagger', app, document);
  }

  await app.listen(3000);
}

void bootstrap();
