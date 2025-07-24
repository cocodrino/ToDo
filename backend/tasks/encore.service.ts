import { Service } from "encore.dev/service";
import { globalErrorHandler } from "../middleware/globalErrorHandler";
import { secret } from "encore.dev/config";

// ENCORE CLOUD HOSTING USE SECRETS INSTEAD OF ENV VARS
const DATABASE_URL = secret("DATABASE_URL")();
if (DATABASE_URL) {
    process.env.DATABASE_URL = DATABASE_URL;
}

export default new Service("tasks", {
    middlewares: [
        globalErrorHandler,
    ],
});
