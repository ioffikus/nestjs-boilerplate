import { AccountEntity } from 'src/modules/accounts/account.entity';
import { ACCOUNT_ROLES } from 'src/shared/constants/account-roles';
import { ConfigService } from 'src/shared/services/config.service';
import type { MigrationInterface, QueryRunner } from 'typeorm';

const config = new ConfigService();

export const admin = {
  role: ACCOUNT_ROLES.ADMIN,
  email: config.admin.email,
  password: config.admin.password,
  isActive: true,
};

export class SeedData1673876797482 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const account = await queryRunner.manager.findOne(AccountEntity, {
      where: {},
    });

    if (!account) {
      await queryRunner.manager.save(AccountEntity, admin);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(queryRunner: QueryRunner): Promise<void> {
    void null;
  }
}
