import { middleware } from "encore.dev/api";
import { handleApiError } from "./errorHandler";

/**
 * Global error handling middleware that applies to all authenticated API endpoints.
 * This middleware catches any unhandled errors and converts them to appropriate APIError responses.
 */
export const globalErrorHandler = middleware({ target: { auth: true } }, async (req, next) => {
    try {
        return await next(req);
    } catch (error) {
        throw handleApiError(error);
    }
}); 