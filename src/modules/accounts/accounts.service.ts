import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isEmail, isUUID } from 'class-validator';
import { omit } from 'lodash';
import { ACCOUNT_ROLES } from 'src/shared/constants/account-roles';
import { ERROR_CODES } from 'src/shared/constants/error-codes';
import { ORDER } from 'src/shared/constants/order';
import { PageMetaDto } from 'src/shared/dto/PageMetaDto';
import { LogicException } from 'src/shared/logic.exception';
import { getSkip } from 'src/shared/utils/get-skip';
import type {
  DeleteResult,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
} from 'typeorm';
import { Repository } from 'typeorm';
import type { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { AccountEntity } from './account.entity';
import { AccountsPageDto } from './dto/AccountsPageDto';

export interface CreateAccountData {
  password: string;
  code: string;
  email?: string;
}

interface UpdateAccountData {
  password?: string;
  code?: string;
  email?: string;
}

interface GetAllOoptions {
  search?: string;
}

interface AccountsPageOptions extends PannerOptions {
  roles?: ACCOUNT_ROLES[];
  email?: string;
  isActive?: boolean;
  isRegComplite?: boolean;
  order?: ORDER;
  orderField?: string;
  search?: string;
  page: number;
  take: number;
}

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(AccountEntity)
    public readonly accountsRepository: Repository<AccountEntity>,
  ) {}

  async findOne(
    options: FindOneOptions<AccountEntity>,
  ): Promise<AccountEntity | undefined> {
    return this.accountsRepository.findOne(options);
  }

  async find(
    query: FindManyOptions<AccountEntity>,
  ): Promise<AccountEntity[] | undefined> {
    return this.accountsRepository.find({ ...query });
  }

  async findOneAndCheckExist(id: number): Promise<AccountEntity> {
    const account = await this.accountsRepository.findOne({ where: { id } });

    if (!account) {
      throw new LogicException(ERROR_CODES.NOT_FOUND_ACCOUNT);
    }

    return account;
  }

  findByNameOrEmail(
    options: Partial<{ name: string; email: string }>,
  ): Promise<AccountEntity | undefined> {
    const queryBuilder = this.accountsRepository.createQueryBuilder('account');

    if (options.email) {
      queryBuilder.orWhere('account.email = :email', {
        email: options.email,
      });
    }

    if (options.name) {
      queryBuilder.orWhere('account.name = :name', {
        name: options.name,
      });
    }

    return queryBuilder.getOne();
  }

  async createAccount(data: CreateAccountData): Promise<AccountEntity> {
    const account = this.accountsRepository.create({
      ...data,
    });

    return this.accountsRepository.save(account);
  }

  async setRole(data: {
    id: string;
    role: ACCOUNT_ROLES;
  }): Promise<{ message: string }> {
    await this.accountsRepository.update(data.id, {
      role: data.role,
    });

    return { message: 'role was updated' };
  }

  async getListAll(
    data: GetAllOoptions,
    roles: ACCOUNT_ROLES[],
  ): Promise<AccountsPageDto> {
    const order = ORDER.ASC;
    const orderField = 'email';
    const page = 1;
    const isActive = true;

    return this.getAccounts({
      roles,
      take: 100,
      order,
      orderField,
      page,
      isActive,
      ...data,
    });
  }

  async getAccounts(
    pageOptionsDto: AccountsPageOptions,
  ): Promise<AccountsPageDto> {
    const queryBuilder = this.accountsRepository.createQueryBuilder('account');

    const where: any = omit(pageOptionsDto, [
      'skip',
      'take',
      'order',
      'page',
      'orderField',
      'search',
      'roles',
    ]);

    const {
      search,
      order = ORDER.ASC,
      orderField = 'id',
      roles,
      page,
      take,
    } = pageOptionsDto;

    const orderBy: any = {};

    orderBy[`account.${orderField}`] = order;

    if (search) {
      if (isUUID(search)) {
        where.id = search;
      } else if (isEmail(search)) {
        where.email = search;
      }
    }

    queryBuilder.where(where);

    if (search && !isUUID(search) && !isEmail(search)) {
      queryBuilder.andWhere(
        `(account.email LIKE '%${search}%' OR account.name LIKE '%${search}%')`,
      );
    }

    if (roles) {
      queryBuilder.andWhere('account.role IN (:...roles)', {
        roles,
      });
    }

    const [accounts, accountsCount] = await queryBuilder
      .orderBy(orderBy)
      .skip(getSkip(page, take))
      .take(take)
      .getManyAndCount();

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto,
      itemCount: accountsCount,
    });

    return new AccountsPageDto(accounts, pageMetaDto);
  }

  async createOrUpdateAccounts(
    accounts: UpdateAccountData[],
  ): Promise<AccountEntity[]> {
    const results: any[] = [];

    for (const account of accounts) {
      const exist = await this.accountsRepository.findOne({
        where: {
          email: account.email,
        },
      });

      if (!exist) {
        const insertResult = await this.accountsRepository.insert(account);

        results.push(insertResult.raw[0]);
      } else {
        results.push(
          await this.accountsRepository.save({
            ...exist,
            ...omit(account, ['password']),
          }),
        );
      }
    }

    return results;
  }

  async isAdmin(accountId: number): Promise<boolean> {
    const account = await this.accountsRepository.findOne({
      where: {
        id: accountId,
      },
    });

    if (!account) {
      return false;
    }

    return account && account.role === ACCOUNT_ROLES.ADMIN;
  }

  async deleteAccount(id: number): Promise<DeleteResult> {
    return this.accountsRepository.delete(id);
  }

  async updatePassword(data: {
    id: number;
    password: string;
  }): Promise<AccountEntity> {
    await this.accountsRepository.save(data);

    return this.accountsRepository.findOne({ where: { id: data.id } });
  }

  async findOneByEmail(email: string): Promise<AccountEntity | undefined> {
    return this.findOne({
      where: {
        email: email.toLowerCase(),
      },
    });
  }

  async getAdminAccount(): Promise<AccountEntity> {
    const account = await this.findOne({
      where: {
        role: ACCOUNT_ROLES.ADMIN,
      },
    });

    if (!account) {
      throw new LogicException(ERROR_CODES.NOT_FOUND_ACCOUNT);
    }

    return account;
  }

  async update(
    criteria: FindOptionsWhere<AccountEntity>,
    partialEntity: QueryDeepPartialEntity<AccountEntity>,
  ): Promise<AccountEntity> {
    await this.accountsRepository.update(criteria, partialEntity);

    return this.accountsRepository.findOne({ where: criteria });
  }
}
