/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth, { User, type DefaultSession } from "next-auth";
import type { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";
import type { IUser } from "../server/database/models/user.model";
import { AdapterUser } from "next-auth/adapters";

// export interface IUser extends DefaultUser, IUser {}
declare module "next-auth" {
  interface Session extends IUser {
    user: IUser & DefaultSession["user"];
  }
}
