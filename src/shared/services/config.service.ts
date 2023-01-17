import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import * as env from 'env-var';
import { AccountSubscriber } from 'src/modules/accounts/account-subscriber';

import { ormconfig } from './orm.config';

export class ConfigService {
  constructor() {
    dotenv.config({ path: `.${this.nodeEnv}.env` });

    // Replace \\n with \n to support multiline strings in AWS
    for (const envName of Object.keys(process.env)) {
      process.env[envName] = process.env[envName].replace(/\\n/g, '\n');
    }
  }

  getHostFromCookieDomain(cookieDomain: string): string {
    if (cookieDomain && cookieDomain[0] === '.') {
      return cookieDomain.slice(1);
    }

    return cookieDomain;
  }

  getKeyValue(name: string): string {
    return env.get(name).asString();
  }

  get appPort(): number {
    return env.get('PORT').default(3000).asIntPositive();
  }

  get isShowDocs(): boolean {
    return env.get('IS_SHOW_DOCS').required().asBoolStrict();
  }

  get isUsePinoPrettyTransport(): boolean {
    return env
      .get('IS_USE_PINO_PRETTY_TRANSPORT')
      .default('false')
      .asBoolStrict();
  }

  get nodeEnv(): string {
    return env.get('NODE_ENV').default('development').required().asString();
  }

  get redis(): {
    url: string;
  } {
    return {
      url: env.get('REDIS_URL').required().asString(),
    };
  }

  get githash(): string {
    return env.get('GITHASH').default('0').required().asString();
  }

  get logLevel(): string {
    return env.get('LOG_LEVEL').default('debug').asString();
  }

  get accessTokenCookieName(): string {
    return env
      .get('ACCESS_TOKEN_COOKIE_NAME')
      .default('accessToken')
      .required()
      .asString();
  }

  getCookieDomain(): string {
    return env.get('COOKIE_DOMAIN').default('localhost').required().asString();
  }

  get cookieMaxAge(): number {
    return env
      .get('COOKIE_MAX_AGE')
      .default(86_400_000)
      .required()
      .asIntPositive();
  }

  get jwt() {
    return {
      expirationTime: 1_231_323, // 'JWT_EXPIRATION_TIME',
      secretKey: 'JWT_SECRET_KEY',
    };
  }

  get rollbar() {
    return {
      token: env.get('ROLLBAR_TOKEN').default('').asString(),
    };
  }

  get isUseVault(): boolean {
    return env.get('IS_USE_VAULT').default('false').asBoolStrict();
  }

  get vault(): {
    tokenPath: string;
    secretsPath: string;
    addr: string;
    keyWallets: string;
  } {
    return {
      tokenPath: env.get('VAULT_TOKEN_PATH').default('').asString(),
      secretsPath: env.get('VAULT_SECRETS_PATH').default('').asString(),
      addr: env.get('VAULT_ADDR').default('').asString(),
      keyWallets: env.get('VAULT_KEY_WALLETS').default('').asString(),
    };
  }

  get admin() {
    return {
      email: env.get('ADMIN_EMAIL').required().asString(),
      password: env.get('ADMIN_PASSWORD').required().asString(),
    };
  }

  get typeOrmConfig(): TypeOrmModuleOptions {
    const databaseConfig = { ...ormconfig };

    if ((<any>module).hot) {
      const entityContext = (<any>require).context(
        './../../modules',
        true,
        /\.entity\.ts$/,
      );
      databaseConfig.entities = entityContext.keys().map((id) => {
        const entityModule = entityContext(id);
        const [entity] = Object.values(entityModule);

        return entity;
      });
      const migrationContext = (<any>require).context(
        './../../migrations',
        false,
        /\.ts$/,
      );
      databaseConfig.migrations = migrationContext.keys().map((id) => {
        const migrationModule = migrationContext(id);
        const [migration] = Object.values(migrationModule);

        return migration;
      });
    }

    return {
      ...databaseConfig,
      keepConnectionAlive: true,
      autoLoadEntities: true,
      subscribers: [AccountSubscriber],
    };
  }
}
