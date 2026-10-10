/**
 * @file app.error.ts
 */

/**
 * Interface representing a custom application error.
 */
export interface AppError extends Error {
    statusCode: number;
}

export class InternalServerError extends Error implements AppError {
    statusCode: number;
    constructor(message: string) {
        super(message);
        this.statusCode = 500;
        this.name = 'InternalServerError';
        Object.setPrototypeOf(this, InternalServerError.prototype);
    }
}

export class BadRequestError extends Error implements AppError {
    statusCode: number;
    constructor(message: string) {
        super(message);
        this.statusCode = 400;
        this.name = 'BadRequestError';
        Object.setPrototypeOf(this, BadRequestError.prototype);
    }
}

export class NotFoundError extends Error implements AppError {
    statusCode: number;
    constructor(message: string) {
        super(message);
        this.statusCode = 404;
        this.name = 'NotFoundError';
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

export class UnauthorizedError extends Error implements AppError {
    statusCode: number;
    constructor(message: string) {
        super(message);
        this.statusCode = 401;
        this.name = 'UnauthorizedError';
        Object.setPrototypeOf(this, UnauthorizedError.prototype);
    }
}

export class ForbiddenError extends Error implements AppError {
    statusCode: number;
    constructor(message: string) {
        super(message);
        this.statusCode = 403;
        this.name = 'ForbiddenError';
        Object.setPrototypeOf(this, ForbiddenError.prototype);
    }
}

export class ConflictError extends Error implements AppError {
    statusCode: number;
    constructor(message: string) {
        super(message);
        this.statusCode = 409;
        this.name = 'ConflictError';
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
}

export class NotImplementedError extends Error implements AppError {
    statusCode: number;
    constructor(message: string) {
        super(message);
        this.statusCode = 501;
        this.name = 'NotImplementedError';
        Object.setPrototypeOf(this, NotImplementedError.prototype);
    }
}

export class DuplicateError extends Error implements AppError {
    statusCode: number;
    constructor(message: string) {
        super(message);
        this.statusCode = 409;
        this.name = 'DuplicateError';
        Object.setPrototypeOf(this, DuplicateError.prototype);
    }
}