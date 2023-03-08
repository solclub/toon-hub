/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth, { User, type DefaultSession } from "next-auth";
import type { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";
import type { MongoUser } from "../server/database/models";
import { AdapterUser } from "next-auth/adapters";

export interface IUser extends DefaultUser, MongoUser {}
declare module "next-auth" {
  // interface User extends DefaultUser {
  //   custom?: string;
  // }
  interface Session {
    user: MongoUser;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  // interface JWT {
  //   user: { id: string };
  // }
}
