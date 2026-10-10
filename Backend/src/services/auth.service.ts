import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repo/user.repository';
import { RegisterDTO, LoginDTO } from '../dto/authdto';
import { serverConfig } from '../config';
import { BadRequestError, UnauthorizedError } from '../utils/errors/app.error';

export async function registerService(data: RegisterDTO) {
    const { name, email, password, role, wardId, organizationName, phone, latitude, longitude, categories } = data;

    if (!name || !email || !password || !role) {
        throw new BadRequestError('Name, email, password and role are required');
    }

    const existing = await userRepository.findByEmail(email);
    if (existing) {
        throw new BadRequestError('Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const userData: any = { name, email, passwordHash, role, wardId, organizationName, phone, categories };

    if (latitude && longitude) {
        userData.location = {
            type: 'Point',
            coordinates: [longitude, latitude]
        };
    }

    try {
        const user = await userRepository.create(userData);
        const token = jwt.sign(
            { id: user._id.toString(), role: user.role, wardId: user.wardId },
            serverConfig.JWT_SECRET,
            { expiresIn: '7d' }
        );
        return { token, user: { id: user._id, name: user.name, email: user.email, role: user.role, wardId: user.wardId, organizationName: user.organizationName } };
    } catch (err: any) {
        // MongoDB duplicate key error
        if (err.code === 11000) {
            throw new BadRequestError('Email already registered');
        }
        console.error('[registerService] DB error:', err);
        throw err;
    }
}

export async function loginService(data: LoginDTO) {
    const { email, password } = data;

    const user = await userRepository.findByEmail(email);
    if (!user) {
        throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
        throw new UnauthorizedError('Invalid email or password');
    }

    const token = jwt.sign(
        { id: user._id.toString(), role: user.role, wardId: user.wardId },
        serverConfig.JWT_SECRET,
        { expiresIn: '7d' }
    );

    return { token, user: { id: user._id, name: user.name, email: user.email, role: user.role, wardId: user.wardId, organizationName: user.organizationName, avatar: user.avatar } };
}

export async function getMeService(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new UnauthorizedError('User not found');
    return user;
}
