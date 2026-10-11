import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors/app.error";

export const appErrorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
    if (!Number.isInteger(err.statusCode) || err.statusCode < 400 || err.statusCode > 599) {
        next(err);
        return;
    }

    console.log(err);

    res.status(err.statusCode).json({
        success: false,
        message: err.message
    });
}

export const genericErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    const safeMessage = err.message.replace(/Unknown API key\s+\S+/i, 'Unknown API key [redacted]');
    console.error('Unhandled request error:', err.name, safeMessage);

    res.status(500).json({
        success: false,
        message: "Internal Server Error"
    });
}