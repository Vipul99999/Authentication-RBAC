import bcrypt from "bcrypt";
import { env } from "../config/env";

const saltRounds = Number(env.BCRYPT_SALT_ROUNDS);

export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (
  password: string,
  hash: string
) => {
  return bcrypt.compare(password, hash);
};