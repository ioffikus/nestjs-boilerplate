import * as bcrypt from 'bcryptjs';
import { isArray } from 'lodash';

export class UtilsService {
  /**
   * convert entity to dto class instance
   * @param {{new(entity: E, options: any): T}} model
   * @param {E[] | E} entity
   * @param options
   * @returns {T[] | T}
   */
  public static toDto<T, E>(
    model: new (entity: E, options?: any) => T,
    entity: E,
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    options?: any,
  ): T;

  public static toDto<T, E>(
    model: new (entity: E, options?: any) => T,
    entity: E[],
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    options?: any,
  ): T[];

  public static toDto<T, E>(
    model: new (entity: E, options?: any) => T,
    entity: E & E[],
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    options?: any,
  ): T | T[] {
    if (isArray(entity)) {
      return entity.map((u) => new model(u, options));
    }

    return new model(entity, options);
  }

  /**
   * generate hash from password or string
   * @param {string} password
   * @returns {string}
   */
  static generateHash(password: string): string {
    return bcrypt.hashSync(password, 10);
  }

  /**
   * generate random string
   * @param length
   */
  static generateRandomString(length: number): string {
    return Math.random()
      .toString(36)
      .replace(/[^\dA-Za-z]+/g, '')
      .slice(0, Math.max(0, length));
  }

  /**
   * validate text with hash
   * @param {string} password
   * @param {string} hash
   * @returns {Promise<boolean>}
   */
  static validateHash(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash || '');
  }

  static percentDiff(a: number, b: number): number {
    return Number(Math.abs(100 - (a / b) * 100).toFixed(10));
  }
}
