import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ACCOUNT_ROLES } from 'src/shared/constants/account-roles';
import { strToLowercase } from 'src/shared/transform-fns/str-to-lowercase';

export class AuthAccountInfoDto {
  @ApiPropertyOptional()
  @Transform(strToLowercase)
  email: string;

  @ApiPropertyOptional({ enum: ACCOUNT_ROLES })
  role: ACCOUNT_ROLES;

  @ApiPropertyOptional()
  isActive: boolean;
}
