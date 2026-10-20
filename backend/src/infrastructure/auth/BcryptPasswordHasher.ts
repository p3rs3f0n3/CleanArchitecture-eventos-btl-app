import bcrypt from "bcryptjs";
import { PasswordHasher } from "../../domain/services/PasswordHasher";

const SALT_ROUNDS = 10;

/** Implementación concreta del puerto PasswordHasher usando bcryptjs
 *  (versión pura JS, sin compilación nativa — más simple de correr en Docker). */
export class BcryptPasswordHasher implements PasswordHasher {
  public async hash(plainText: string): Promise<string> {
    return bcrypt.hash(plainText, SALT_ROUNDS);
  }

  public async compare(plainText: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainText, hash);
  }
}
