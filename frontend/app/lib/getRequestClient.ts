import { cookies } from "next/headers";
import Client, { Environment } from "./client";

/**
 * Returns the Encore request client for either the local or staging environment.
 * If we are running the frontend locally (development) we assume that our Encore backend is also running locally
 * and make requests to that, otherwise we use the staging client.
 */
const getRequestClient = () => {
  const token = cookies().get("__session")?.value || "";
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
