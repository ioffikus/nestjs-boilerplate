import { ACCOUNT_ROLES } from 'src/shared/constants/account-roles';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { AccountDto } from './dto/AccountDto';

@Entity({ name: 'accounts' })
export class AccountEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ type: 'enum', enum: ACCOUNT_ROLES })
  role: ACCOUNT_ROLES;

  @Column({ nullable: true })
  password: string;

  @Column({ default: true })
  isActive: boolean;

  dtoClass = AccountDto;
}
