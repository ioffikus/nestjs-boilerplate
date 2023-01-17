import type { MigrationInterface, QueryRunner } from 'typeorm';

export class InitDB1673876745321 implements MigrationInterface {
  name = 'InitDB1673876745321';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TYPE "public"."accounts_role_enum" AS ENUM(\'ADMIN\')',
    );
    await queryRunner.query(
      // eslint-disable-next-line max-len
      'CREATE TABLE "accounts" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "role" "public"."accounts_role_enum" NOT NULL, "password" character varying, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_ee66de6cdc53993296d1ceb8aa0" UNIQUE ("email"), CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY ("id"))',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "accounts"');
    await queryRunner.query('DROP TYPE "public"."accounts_role_enum"');
  }
}
