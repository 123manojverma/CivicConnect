import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { registerService, loginService, getMeService } from '../services/auth.service';
import { InternalServerError } from '../utils/errors/app.error';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export const registerHandler = async (req: Request, res: Response) => {
    try {
        const result = await registerService(req.body);
        res.cookie('token', `Bearer ${result.token}`, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: 'lax'
        });
        res.status(StatusCodes.CREATED).json({ success: true, message: 'Registered successfully', data: result });
    } catch (error: any) {
        // Rethrow known app errors (BadRequestError, UnauthorizedError, etc.) as-is
        if (error && typeof error.statusCode === 'number') throw error;
        // Log and wrap unknown errors
        console.error('[registerHandler] Unexpected error:', error);
        throw new InternalServerError(error?.message || 'Registration failed');
    }
};

export const loginHandler = async (req: Request, res: Response) => {
    try {
        const result = await loginService(req.body);
        res.cookie('token', `Bearer ${result.token}`, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: 'lax'
        });
        res.status(StatusCodes.OK).json({ success: true, message: 'Login successful', data: result });
    } catch (error: any) {
        throw error;
    }
};

export const logoutHandler = async (req: Request, res: Response) => {
    res.clearCookie('token');
    res.status(StatusCodes.OK).json({ success: true, message: 'Logged out successfully' });
};

export const getMeHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = await getMeService(req.user!.id);
        res.status(StatusCodes.OK).json({ success: true, data: user });
    } catch (error) {
        throw new InternalServerError('Failed to get user');
    }
};

export const updateProfileHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { userRepository } = await import('../repo/user.repository');
        const allowed = ['phone', 'organizationName', 'wardId', 'categories', 'location', 'avatar'];
        const update: any = {};
        allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
        const user = await userRepository.updateById(req.user!.id, update);
        res.status(StatusCodes.OK).json({ success: true, data: user });
    } catch (error) {
        throw new InternalServerError('Failed to update profile');
    }
};
