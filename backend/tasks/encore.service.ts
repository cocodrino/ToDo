import { Service } from "encore.dev/service";
import { globalErrorHandler } from "../middleware/globalErrorHandler";

export default new Service("tasks", {
    middlewares: [
        globalErrorHandler,
    ],
});
