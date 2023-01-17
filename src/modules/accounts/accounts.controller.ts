import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { isString } from 'lodash';
import { ACCOUNT_ROLES } from 'src/shared/constants/account-roles';
import { ERROR_CODES } from 'src/shared/constants/error-codes';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { ErrorResponseDto } from 'src/shared/dto/ErrorResponseDto';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { AuthAccountInterceptor } from 'src/shared/interceptors/auth-account-interceptor.service';
import { LogicException } from 'src/shared/logic.exception';

import { AccountsService } from './accounts.service';
import { AccountDto } from './dto/AccountDto';
import { AccountsPageDto } from './dto/AccountsPageDto';
import { AccountsPageOptionsDto } from './dto/AccountsPageOptionsDto';

@Controller()
@ApiTags('Accounts')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(AuthAccountInterceptor)
@ApiBearerAuth()
@ApiBadRequestResponse({
  type: ErrorResponseDto,
})
export class AccountsController {
  constructor(private accountsService: AccountsService) {}

  @Get('accounts')
  @Roles(ACCOUNT_ROLES.ADMIN)
  @ApiOperation({
    summary: 'Get accounts',
    description: '',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: AccountsPageDto,
  })
  getAccounts(
    @Query()
    pageOptionsDto: AccountsPageOptionsDto,
  ): Promise<AccountsPageDto> {
    return this.accountsService.getAccounts(pageOptionsDto);
  }

  @Get('accounts/:id')
  @Roles(ACCOUNT_ROLES.ADMIN)
  @ApiOperation({
    summary: 'Get account by id',
    description: '',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: AccountDto,
  })
  async getAccount(@Param('id') id: number): Promise<AccountDto> {
    if (!isString(id)) {
      throw new LogicException(ERROR_CODES.NOT_FOUND_ACCOUNT);
    }

    const account = await this.accountsService.findOneAndCheckExist(id);

    return new AccountDto(account);
  }
}
