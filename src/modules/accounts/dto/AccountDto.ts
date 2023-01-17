import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ACCOUNT_ROLES } from 'src/shared/constants/account-roles';
import { strToLowercase } from 'src/shared/transform-fns/str-to-lowercase';

import type { AccountEntity } from '../account.entity';

export class AccountDto {
  @ApiProperty()
  id: number;

  @ApiPropertyOptional()
  @Transform(strToLowercase)
  email: string;

  @ApiPropertyOptional({ enum: ACCOUNT_ROLES })
  role: ACCOUNT_ROLES;

  @ApiPropertyOptional()
  isActive: boolean;

  constructor(account: AccountEntity) {
    this.id = account.id;
    this.email = account.email;
    this.role = account.role;
    this.isActive = account.isActive;
  }
}
