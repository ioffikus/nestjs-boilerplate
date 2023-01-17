import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import * as Cookies from 'cookies';
import { Request, Response } from 'express';
import { AuthAccount } from 'src/shared/decorators/auth-account.decorator';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { AuthAccountInterceptor } from 'src/shared/interceptors/auth-account-interceptor.service';
import { ConfigService } from 'src/shared/services/config.service';

import { AccountsService } from '../accounts/accounts.service';
import { AccountDto } from '../accounts/dto/AccountDto';
import { AuthAccountInfoDto } from '../accounts/dto/AuthAccountInfoDto';
import { AuthService } from './auth.service';
import { AccountLoginDto } from './dto/AccountLoginDto';
import { LoginPayloadDto } from './dto/LoginPayloadDto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    public readonly accountsService: AccountsService,
    public readonly authService: AuthService,
    public readonly configService: ConfigService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login',
    description: '',
  })
  @ApiOkResponse({
    type: LoginPayloadDto,
  })
  async accountLogin(
    @Body() accountLoginDto: AccountLoginDto,
    @Req()
    req: Request,
    @Res({ passthrough: true })
    res: Response,
  ): Promise<LoginPayloadDto> {
    const results = await this.authService.login(accountLoginDto, req);

    const cookies = Cookies(req, res as any);

    try {
      if (results.token) {
        cookies.set(
          this.configService.accessTokenCookieName,
          results.token.accessToken,
          {
            httpOnly: true,
            overwrite: true,
            domain: this.configService.getCookieDomain(),
            maxAge: this.configService.cookieMaxAge,
          },
        );
      }
    } catch (error) {
      console.error(error);
    }

    return results;
  }

  @Get('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @UseInterceptors(AuthAccountInterceptor)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout',
    description: '',
  })
  logout(
    @Req()
    req: Request,
    @Res({ passthrough: true })
    res: Response,
  ): Promise<any> {
    const cookies = Cookies(req, res as any);

    cookies.set(this.configService.accessTokenCookieName, null, {
      httpOnly: true,
      maxAge: 0,
      overwrite: true,
      domain: this.configService.getCookieDomain(),
    });

    return Promise.resolve({
      msg: 'ok',
    });
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @UseInterceptors(AuthAccountInterceptor)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get authorized account info',
    description: '',
  })
  @ApiOkResponse({ type: AuthAccountInfoDto })
  async getCurrentAccount(
    @AuthAccount() account: AccountDto,
  ): Promise<AuthAccountInfoDto> {
    const acc = await this.accountsService.findOne({
      where: { id: account.id },
    });

    return new AccountDto(acc);
  }
}
