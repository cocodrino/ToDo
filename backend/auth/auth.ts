import { APIError, Gateway, type Header, api } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";
import { Clerk } from "@clerk/clerk-sdk-node";

const clerk = Clerk({
  secretKey: process.env.CLERK_SECRET_KEY,
});

interface AuthParams {
  authorization: Header<"Authorization">;
}

export const myAuthHandler = authHandler(
  async (params: AuthParams): Promise<{ userID: string }> => {
    if (!params.authorization) {
      throw APIError.unauthenticated("no token provided");
    }

    const token = params.authorization.replace("Bearer ", "");

    try {
      const client = await clerk.verifyToken(token);
      return { userID: client.sub };
    } catch (error) {
      throw APIError.unauthenticated("invalid token");
    }
  }
);

export const gateway = new Gateway({ authHandler: myAuthHandler });
