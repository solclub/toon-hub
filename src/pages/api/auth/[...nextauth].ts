/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth, { type NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import TwitterProvider from "next-auth/providers/twitter";
import CredentialsProvider from "next-auth/providers/credentials";
import { env } from "env/server.mjs";
import { getSession } from "next-auth/react";
import { SigninMessage } from "utils/signin-message";
import type { NextApiRequest, NextApiResponse } from "next";
import userModel from "server/database/models/user.model";

export const getOptions = (req: NextApiRequest): NextAuthOptions => {
  const options = {
    callbacks: {
      jwt: async ({ token, user, account, profile }: any) => {
        if (!user) {
          return token;
        }

        const anyProfile = profile as any;
        const { name, email, image } = user;

        token.name = name;
        token.email = email;
        token.test = account?.account;
        token.picture = image;
        token.user = user;

        if (account?.provider === "twitter") {
          token.user = {
            ...user,
            username: anyProfile?.data?.username || name,
          };
        } else if (account?.provider === "discord") {
          token.user = {
            ...user,
            username: `${anyProfile?.username}#${anyProfile?.discriminator}` || name,
          };
        }

        return token;
      },
      session: async ({ session, token }: any) => {
        const walletId = (token as any)?.user?.id;
        
        if (!walletId) {
          return session;
        }
        
        const exists = await userModel().findOne({ walletId });
        
        if (exists) {
          const userData = exists.toObject();
          return {
            ...session,
            user: {
              ...session.user,
              ...userData
            }
          };
        }
        
        return {
          ...session,
          user: {
            ...session.user,
            id: walletId,
            walletId: walletId
          }
        };
      },
    },
    // Configure one or more authentication providers
    providers: [
      DiscordProvider({
        name: "discord",
        clientId: env.DISCORD_CLIENT_ID,
        clientSecret: env.DISCORD_CLIENT_SECRET,
        profile: async (profile) => {
          if (profile.avatar === null) {
            const defaultAvatarNumber = parseInt(profile.discriminator) % 5;
            profile.image_url = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png`;
          } else {
            const format = profile.avatar.startsWith("a_") ? "gif" : "png";
            profile.image_url = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${format}`;
          }

          const user = await getSession({ req });
          await saveProviderData("discord", user?.user.id ?? "", profile);
          return {
            id: user?.user.id || "",
            name: profile.username,
            email: profile.email,
            image: profile.image_url,
          };
        },
      }),
      TwitterProvider({
        name: "twitter",
        clientId: env.TWITTER_CLIENT_ID,
        clientSecret: env.TWITTER_CLIENT_SECRET,
        version: "2.0",
        profile: async (profile) => {
          const user = await getSession({ req });
          await saveProviderData("twitter", user?.user.id ?? "", profile);

          return {
            id: user?.user.id || "",
            name: (profile as any).data?.username || (profile as any).screen_name || "",
            // NOTE: E-mail is currently unsupported by OAuth 2 Twitter.
            email: null,
            image: (profile as any).data?.profile_image_url || (profile as any).profile_image_url,
          };
        },
      }),
      CredentialsProvider({
        id: "credentials",
        name: "Solana",
        credentials: {
          message: {
            label: "Message",
            type: "text",
          },
          signature: {
            label: "Signature",
            type: "text",
          },
          csrfToken: {
            label: "CSRF Token",
            type: "text",
          },
        },
        async authorize(credentials) {
          if (!credentials) {
            console.error("❌ No credentials provided");
            return null;
          }
          
          try {
            const { message, signature, csrfToken } = credentials;
            
            if (!message || !signature || !csrfToken) {
              console.error("❌ Missing message, signature, or CSRF token");
              return null;
            }

            const signinMessage = new SigninMessage(message);

            if (signinMessage.nonce !== csrfToken) {
              console.error("❌ Nonce mismatch:", { expected: csrfToken, received: signinMessage.nonce });
              return null;
            }

            const validationResult = signinMessage.validate(signature);
            
            if (!validationResult) {
              console.error("❌ Signature validation failed");
              return null;
            }

            const user = await userModel().findOne({ walletId: signinMessage.publicKey });
            
            if (!user) {
              console.log("👤 Creating new user...");
              await userModel().create({
                walletId: signinMessage.publicKey,
                twitterVerified: false,
                discordVerified: false,
                twitterDetails: null,
                discordDetails: null,
                totalPower: 0,
                totalTraining: 0,
                totalWarriors: 0,
                golemNumbers: null,
                golemKeys: null,
                demonNumbers: null,
                demonKeys: null,
              });
            }

            return {
              id: signinMessage.publicKey,
            };
          } catch (e) {
            console.error("❌ AUTHORIZE ERROR:", e);
            console.error("❌ Error stack:", e instanceof Error ? e.stack : "No stack trace");
            return null;
          }
        },
      }),
    ],
  };
  
  return options;
};

const saveProviderData = async (provider: string, id: string, profile: any) => {
  const userModelInstance = userModel();

  const updateDetails = {
    upsert: true,
  };

  if (provider === "twitter") {
    const { data } = profile;
    const twitterDetails = {
      email: null,
      image: data.profile_image_url,
      name: data.name,
      username: data.username,
    };

    try {
      await userModelInstance.updateOne(
        { walletId: id },
        { twitterVerified: true, twitterDetails },
        updateDetails
      );
    } catch (error) {
      console.error(error);
    }
  }

  if (provider === "discord") {
    const { email, image_url, username, discriminator } = profile;
    const discordDetails = {
      email,
      image: image_url,
      name: username,
      username: `${username}#${discriminator}`,
    };

    try {
      await userModelInstance.updateOne(
        { walletId: id },
        { discordVerified: true, discordDetails },
        updateDetails
      );
    } catch (error) {
      console.error(error);
    }
  }
};

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  console.log("📡 NextAuth handler called with:", req.method, req.url);
  return await NextAuth(req, res, getOptions(req));
}
