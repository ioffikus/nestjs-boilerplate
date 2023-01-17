export interface ErrorCodeItem {
  code: string;
  text: string;
}

export const ERROR_CODES = {
  UNKNOWN: {
    code: 'unknown',
    text: 'unknown',
  },

  NOT_IMPLEMENTED: (method: string) => ({
    code: 'not_implemented',
    text: `${method} not implemented `,
  }),

  IS_VALUE_UNDEFINED: (data: { value: string }) => ({
    code: 'is_value_undefined',
    text: `${data.value} is undefined`,
  }),

  PG: {
    code: 'pg',
    text: 'postgres error',
  },

  VALIDATION: {
    code: 'validation',
    text: 'validation error',
  },

  AUTH: {
    code: 'auth',
    text: 'auth error',
  },

  NO_ACCESS: {
    code: 'no_access',
    text: 'no access',
  },

  NOT_FORMATTED: {
    code: 'not_formatted',
    text: 'not formatted',
  },

  UNHANDLED: {
    code: 'unhandled',
    text: 'unhandled error',
  },

  NOT_FOUND: {
    code: 'not_found',
    text: 'not found',
  },

  NOT_FOUND_ACCOUNT: {
    code: 'not_found_account',
    text: 'account not found',
  },

  INVALID_PASSWORD: {
    code: 'invalid_password',
    text: 'invalid password',
  },

  NOT_FOUND_QUEUE: {
    code: 'not_found_queue',
    text: 'queue not found',
  },
};
