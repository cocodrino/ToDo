# Error Handling Middleware

This directory contains the error handling middleware system for the Encore backend application.

## Overview

The error handling system consists of three main components:

1. **Error Handler** (`errorHandler.ts`) - Core error processing logic
2. **Global Error Handler** (`globalErrorHandler.ts`) - Reusable middleware component
3. **Service Configuration** - Application of middleware to services

## Components

### Error Handler (`errorHandler.ts`)

The core error processing function that converts various types of errors into appropriate `APIError` responses.

**Supported Error Types:**
- **Prisma Database Errors**: All Prisma error codes (P2000-P2027) with specific HTTP status codes
- **Network Errors**: Connection timeouts, refused connections, etc.
- **Validation Errors**: Data validation failures
- **Authentication Errors**: Already handled API errors
- **Unknown Errors**: Fallback for unexpected errors

**Error Code Mapping:**
- `P2002` (Unique constraint) → 409 Conflict
- `P2025` (Not found) → 404 Not Found
- `P2003` (Foreign key) → 400 Bad Request
- `P2024` (Connection timeout) → 503 Service Unavailable
- Network timeouts → 408 Request Timeout
- Connection errors → 503 Service Unavailable

### Global Error Handler (`globalErrorHandler.ts`)

A reusable middleware component that applies error handling to all authenticated API endpoints.

**Features:**
- Automatic error catching and conversion
- Logging of all errors for debugging
- Consistent error responses across the application
- Targets only authenticated endpoints (`auth: true`)

### Service Configuration

The middleware is applied to services through the `encore.service.ts` configuration:

```typescript
import { Service } from "encore.dev/service";
import { globalErrorHandler } from "../middleware/globalErrorHandler";

export default new Service("tasks", {
  middlewares: [
    globalErrorHandler,
  ],
});
```

## Usage

### Adding to a New Service

1. Import the global error handler:
   ```typescript
   import { globalErrorHandler } from "../middleware/globalErrorHandler";
   ```

2. Add it to the service configuration:
   ```typescript
   export default new Service("yourService", {
     middlewares: [
       globalErrorHandler,
     ],
   });
   ```

### Custom Error Handling

If you need custom error handling for a specific service, you can:

1. Create a custom middleware using the `handleApiError` function:
   ```typescript
   import { middleware } from "encore.dev/api";
   import { handleApiError } from "../middleware/errorHandler";

   const customErrorHandler = middleware({ target: { auth: true } }, async (req, next) => {
     try {
       return await next(req);
     } catch (error) {
       // Custom error processing logic here
       throw handleApiError(error);
     }
   });
   ```

2. Apply it to your service:
   ```typescript
   export default new Service("yourService", {
     middlewares: [
       customErrorHandler,
     ],
   });
   ```

## Benefits

1. **Centralized Error Handling**: All errors are processed consistently
2. **Automatic Logging**: All errors are logged for debugging
3. **Security**: No internal error details are exposed to clients
4. **Maintainability**: Easy to add new error types or modify handling
5. **Performance**: Efficient error processing with minimal overhead

## Error Response Format

All errors are returned as `APIError` objects with:
- **Code**: Appropriate HTTP status code
- **Message**: User-friendly error message
- **Logging**: Detailed error information logged for debugging

## Testing

To test the error handling:

1. **Database Errors**: Try operations with invalid data
2. **Network Errors**: Simulate connection issues
3. **Validation Errors**: Send malformed requests
4. **Authentication Errors**: Test with invalid credentials

The middleware will automatically catch and convert these errors to appropriate HTTP responses. 