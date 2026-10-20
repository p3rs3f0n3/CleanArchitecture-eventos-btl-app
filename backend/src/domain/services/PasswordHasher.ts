/**
 * Puerto (interfaz) para el hasheo de contraseñas. El dominio y los casos de
 * uso dependen de ESTO, nunca de bcrypt directamente — así, si el día de
 * mañana cambiás bcrypt por argon2, ningún caso de uso se entera.
 */
export interface PasswordHasher {
  hash(plainText: string): Promise<string>;
  compare(plainText: string, hash: string): Promise<boolean>;
}
