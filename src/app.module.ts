import { AdminModule } from '@adminjs/nestjs';
import * as AdminJSTypeorm from '@adminjs/typeorm';
import type { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import AdminJS from 'adminjs';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { err } from 'pino-std-serializers';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccountEntity } from './modules/accounts/account.entity';
import { AccountsModule } from './modules/accounts/accounts.module';
import { AuthModule } from './modules/auth/auth.module';
import { contextMiddleware } from './shared/middlewares';
import { ConfigService } from './shared/services/config.service';
import { SharedModule } from './shared/shared.module';

const pinoPrettyLogsTransport = {
  target: 'pino-pretty',
  options: {
    singleLine: true,
    colorize: true,
    levelFirst: true,
    translateTime: 'h:MM:ss',
  },
};

const authenticate = async (
  email: string,
  password: string,
  configService: ConfigService,
) => {
  if (
    email === configService.admin.email &&
    password === configService.admin.password
  ) {
    return Promise.resolve({
      email: configService.admin.email,
      password: configService.admin.password,
    });
  }

  return null;
};

AdminJS.registerAdapter({
  Resource: AdminJSTypeorm.Resource,
  Database: AdminJSTypeorm.Database,
});

@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      imports: [SharedModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        pinoHttp: {
          quietReqLogger: true,
          base: null,
          level: configService.logLevel,
          timestamp: () => `,"time":"${new Date().toISOString()}"`,
          serializers: {
            error: err,
          },
          formatters: {
            level: (label) => ({ level: label }),
            log: (msgObject: any) => {
              if (msgObject.context && msgObject.message) {
                const { context, message, ...rest } = msgObject;

                return { msg: `${context} > ${message}`, ...rest };
              }

              return msgObject;
            },
          },
          redact: {
            paths: ['req.id', 'req.headers', 'res.headers'],
            censor: '[Redacted]',
          },
          useLevelLabels: true,
          transport: configService.isUsePinoPrettyTransport
            ? pinoPrettyLogsTransport
            : null,
        },
      }),
    }),
    SharedModule,
    TypeOrmModule.forRootAsync({
      imports: [SharedModule],
      useFactory: (configService: ConfigService) => configService.typeOrmConfig,
      inject: [ConfigService],
    }),
    AccountsModule,
    AuthModule,
    AdminModule.createAdminAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        adminJsOptions: {
          rootPath: '/admin',
          resources: [AccountEntity],
        },
        auth: {
          authenticate: (email, password) =>
            authenticate(email, password, configService),
          cookieName: 'adminjs',
          cookiePassword: 'secret',
        },
        sessionOptions: {
          resave: true,
          saveUninitialized: true,
          secret: 'secret',
        },
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): MiddlewareConsumer | void {
    consumer.apply(contextMiddleware).forRoutes('*');
  }
}
