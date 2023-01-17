import { BadRequestException } from '@nestjs/common';

import type { ErrorCodeItem } from './constants/error-codes';

export class LogicException extends BadRequestException {
  constructor(errorCodeItem: ErrorCodeItem) {
    super({
      messages: [errorCodeItem],
    });
  }
}
