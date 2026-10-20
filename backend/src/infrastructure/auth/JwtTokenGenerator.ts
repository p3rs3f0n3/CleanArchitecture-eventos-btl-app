import jwt from "jsonwebtoken";
import { TokenGenerator, TokenPayload } from "../../domain/services/TokenGenerator";
import { env } from "../config/env";

export class JwtTokenGenerator implements TokenGenerator {
  public generate(payload: TokenPayload): string {
    return jwt.sign(payload, env.jwtSecret, { expiresIn: "8h" });
  }

  public verify(token: string): TokenPayload {
    return jwt.verify(token, env.jwtSecret) as TokenPayload;
  }
}
