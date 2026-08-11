import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { createHash, randomBytes } from 'crypto';

/**
 * Encapsula el hashing. Si algún día se cambia Argon2id por otro algoritmo,
 * este es el único archivo que hay que tocar.
 */
@Injectable()
export class PasswordService {
  private readonly options: argon2.Options = {
    type: argon2.argon2id,
    memoryCost: 19_456,
    timeCost: 2,
    parallelism: 1,
  };

  hash(plain: string): Promise<string> {
    return argon2.hash(plain, this.options);
  }

  async verify(hash: string, plain: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plain);
    } catch {
      return false;
    }
  }

  /** Token opaco para refresh / reset de contraseña. */
  randomToken(bytes = 48): string {
    return randomBytes(bytes).toString('base64url');
  }

  /** Los tokens se guardan hasheados en la BD, nunca en claro. */
  sha256(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }
}
