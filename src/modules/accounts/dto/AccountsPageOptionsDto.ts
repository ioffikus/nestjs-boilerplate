import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsOptional } from 'class-validator';
import { ACCOUNT_ROLES } from 'src/shared/constants/account-roles';
import { PageOptionsDto } from 'src/shared/dto/PageOptionsDto';
import { strToAccountRole } from 'src/shared/transform-fns/str-to-account-role';
import { strToLowercase } from 'src/shared/transform-fns/str-to-lowercase';

export class AccountsPageOptionsDto extends PageOptionsDto {
  @ApiPropertyOptional({ isArray: true, type: [ACCOUNT_ROLES] })
  @IsOptional()
  @Transform(strToAccountRole)
  roles?: ACCOUNT_ROLES[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  @Transform(strToLowercase)
  email?: string;
}
