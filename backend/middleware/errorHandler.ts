import { APIError, ErrCode } from "encore.dev/api";
import log from "encore.dev/log";
import { Prisma } from "@prisma/client";

export function handleApiError(error: unknown): APIError {
    // Log the error for debugging
    log.error("API Error occurred", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
    });

    // Prisma known request errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case 'P2002': // Unique constraint violation
                return new APIError(ErrCode.AlreadyExists, "Resource already exists");
            case 'P2025': // Record not found
                return new APIError(ErrCode.NotFound, "Resource not found");
            case 'P2003': // Foreign key constraint violation
                return new APIError(ErrCode.InvalidArgument, "Invalid reference");
            case 'P2000': // Value too long for column
                return new APIError(ErrCode.InvalidArgument, "Data too long for field");
            case 'P2001': // Record not found in where clause
                return new APIError(ErrCode.NotFound, "Record not found");
            case 'P2014': // Invalid ID provided
                return new APIError(ErrCode.InvalidArgument, "Invalid ID provided");
            case 'P2015': // Related record not found
                return new APIError(ErrCode.NotFound, "Related record not found");
            case 'P2016': // Query interpretation error
                return new APIError(ErrCode.InvalidArgument, "Invalid query");
            case 'P2017': // Relation not connected
                return new APIError(ErrCode.InvalidArgument, "Relation not connected");
            case 'P2018': // Connected records not found
                return new APIError(ErrCode.NotFound, "Connected records not found");
            case 'P2019': // Input error
                return new APIError(ErrCode.InvalidArgument, "Invalid input data");
            case 'P2020': // Value out of range
                return new APIError(ErrCode.InvalidArgument, "Value out of range");
            case 'P2021': // Table does not exist
                return new APIError(ErrCode.Internal, "Database table not found");
            case 'P2022': // Column does not exist
                return new APIError(ErrCode.Internal, "Database column not found");
            case 'P2023': // Column data type mismatch
                return new APIError(ErrCode.InvalidArgument, "Data type mismatch");
            case 'P2024': // Connection pool timeout
                return new APIError(ErrCode.Unavailable, "Database connection timeout");
            case 'P2026': // Current database provider does not support a feature
                return new APIError(ErrCode.Unimplemented, "Database feature not supported");
            case 'P2027': // Multiple errors occurred
                return new APIError(ErrCode.Internal, "Multiple database errors occurred");
            default:
                return new APIError(ErrCode.Internal, "Database error occurred");
        }
    }

    // Prisma unknown request errors (connection issues, etc.)
    if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        return new APIError(ErrCode.Unavailable, "Database temporarily unavailable");
    }

    // Prisma validation errors
    if (error instanceof Prisma.PrismaClientValidationError) {
        return new APIError(ErrCode.InvalidArgument, "Invalid data provided");
    }

    // Prisma initialization errors
    if (error instanceof Prisma.PrismaClientInitializationError) {
        return new APIError(ErrCode.Unavailable, "Database connection failed");
    }

    // Timeout errors
    if (error instanceof Error && (
        error.message.includes('timeout') ||
        error.message.includes('ETIMEDOUT') ||
        error.message.includes('ECONNRESET')
    )) {
        return new APIError(ErrCode.DeadlineExceeded, "Request timed out");
    }

    // Network errors
    if (error instanceof Error && (
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('ENOTFOUND')
    )) {
        return new APIError(ErrCode.Unavailable, "Service temporarily unavailable");
    }

    // Already handled API errors
    if (error instanceof APIError) {
        return error;
    }

    // Unknown errors
    return new APIError(ErrCode.Internal, "An unexpected error occurred");
} 