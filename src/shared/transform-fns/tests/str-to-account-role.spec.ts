import type { TransformFnParams } from 'class-transformer';

import { strToAccountRole } from '../str-to-account-role';
import { ACCOUNT_ROLES } from './../../constants/account-roles';

describe('тестируем strToAccountRole', () => {
  it('одно значение должно возвращать массив с значением', () => {
    const value = 'ADMIN';

    expect(strToAccountRole({ value } as TransformFnParams)).toEqual([
      ACCOUNT_ROLES.ADMIN,
    ]);
  });

  it(', должно возвращать null', () => {
    const value = ',';

    expect(strToAccountRole({ value } as TransformFnParams)).toEqual(null);
  });
});
