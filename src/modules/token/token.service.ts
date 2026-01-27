import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import { IUserDoc } from "../user/user.interfaces";
import config from "../../config";
import { logger } from "../logger";

const { secret, jwtExpiresIn } = config.jwt;

// const verify = promisify(jwt.verify);

const signToken = (id: string) => {
  return jwt.sign({ id, iat: new Date().getTime() / 1000 }, secret, {
    expiresIn: jwtExpiresIn,
  });
};

export const verifyToken = async (token: string): Promise<JwtPayload> => {
  // eslint-disable-next-line @typescript-eslint/no-redeclare
  let returnValue: JwtPayload;
  try {
    returnValue = jwt.verify(token, secret) as JwtPayload;
  } catch (err) {
    logger.error(err);
    returnValue = {};
  }
  console.log(returnValue, ": return value");
  return returnValue;
};

export const createSendToken = (
  user: IUserDoc,
  statusCode: number,
  req: Request,
  res: Response
) => {
  const token = signToken(user._id);
  res.cookie("jwt", token, {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  });

  // Remove password from output
  // eslint-disable-next-line no-param-reassign
  user.password = undefined;
  user.adminOnlyView = "";

  res.status(statusCode).json({
    status: "success",
    token,
    user,
  });
};
