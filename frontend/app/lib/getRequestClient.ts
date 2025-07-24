import Client, { Environment } from "./client";
import logger from "@/lib/logger";

/**
 * Returns the Encore request client for either the local or staging environment.
 * If we are running the frontend locally (development) we assume that our Encore backend is also running locally
 * and make requests to that, otherwise we use the staging client.
 * 
 * This function works in both server and client environments:
 * - Server: Uses next/headers to get cookies
 * - Client: Uses document.cookie to get the session token
 */
const getRequestClient = () => {
  let token = "";

  // Check if we're in a server environment
  if (typeof window === "undefined") {
    // Server-side: use next/headers
    try {
      const { cookies } = require("next/headers");
      const cookieStore = cookies();
      const sessionCookie = cookieStore.get("__session");
      token = sessionCookie?.value || "";
    } catch (error) {
      logger.warn("Could not get cookies from next/headers:", error);
    }
  } else {
    // Client-side: use document.cookie
    try {
      const cookies = document.cookie.split(";");
      const sessionCookie = cookies.find(cookie =>
        cookie.trim().startsWith("__session=")
      );
      if (sessionCookie) {
        token = sessionCookie.split("=")[1];
      }
    } catch (error) {
      logger.warn("Could not get cookies from document.cookie:", error);
    }
  }

  const localUrl = process.env.BACKEND_URL;

  if (!localUrl) {
    throw new Error("BACKEND_URL is not set");
  }

  const env =
    process.env.NODE_ENV === "development"
      ? localUrl
      : Environment("staging");

  return new Client(env, {
    auth: { authorization: token },
  });
};

export default getRequestClient;
