import jwt from "jsonwebtoken";
import { env } from "../config/env";

type Payload = {
  userId: string;
  role?: string;
};

export const signAccessToken = (payload: Payload) => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: "15m",
  });
};

export const signRefreshToken = (payload: Payload) => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: "1d",
  });
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as Payload;//it returns the decoded payload if the token is valid, otherwise it throws an error.
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as Payload;
};