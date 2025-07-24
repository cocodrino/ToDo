import Client, { Environment } from "./client";
import logger from "./logger";

/**
 * Returns the Encore request client for client-side usage only.
 * This version is specifically designed for React Query and other client-side operations.
 */
const getClientRequestClient = () => {
    let token = "";

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

    const localUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!localUrl) {
        throw new Error("NEXT_PUBLIC_BACKEND_URL is not set");
    }

    const env =
        process.env.NEXT_PUBLIC_NODE_ENV === "development"
            ? localUrl
            : Environment("staging");

    return new Client(env, {
        auth: { authorization: token },
    });
};

export default getClientRequestClient; 