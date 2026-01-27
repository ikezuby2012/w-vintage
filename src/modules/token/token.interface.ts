import { JwtPayload } from "jsonwebtoken";

export interface IPayload extends JwtPayload {
  sub: string;
  iat: number;
  exp: number;
  type?: string | undefined;
}

export type JPayload = Partial<IPayload>;
export interface TokenPayload {
  token: string;
  expires: Date;
}

export interface AccessAndRefreshTokens {
  access: TokenPayload;
  refresh: TokenPayload;
}
