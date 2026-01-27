import {  IUserDoc } from "modules/user/user.interfaces";

export {};

declare global {
  namespace Express {
    interface Request {
      user?: IUserDoc;
    }
  }
}