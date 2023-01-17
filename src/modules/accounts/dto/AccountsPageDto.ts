import { ApiProperty } from '@nestjs/swagger';
import { PageMetaDto } from 'src/shared/dto/PageMetaDto';

import type { AccountEntity } from '../account.entity';
import { AccountDto } from './AccountDto';

export class AccountsPageDto {
  @ApiProperty({
    type: AccountDto,
    isArray: true,
  })
  readonly items: AccountDto[];

  @ApiProperty()
  readonly meta: PageMetaDto;

  constructor(items: AccountEntity[], meta: PageMetaDto) {
    this.items = [];

    for (const item of items) {
      this.items.push(new AccountDto(item));
    }

    this.meta = meta;
  }
}
