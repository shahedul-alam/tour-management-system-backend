import { JwtPayload } from "jsonwebtoken";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      tokenUser?: JwtPayload;
    }
  }
}