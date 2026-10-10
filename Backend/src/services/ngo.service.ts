import { userRepository } from '../repo/user.repository';

export async function getNearbyNGOsService(longitude: number, latitude: number, maxDistance: number = 10000, category?: string) {
    return await userRepository.findNearbyNGOs(longitude, latitude, maxDistance, category);
}

export async function getNGOProfileService(ngoId: string) {
    return await userRepository.findById(ngoId);
}

export async function getAllNGOsService() {
    const { User } = await import('../models/User');
    return await User.find({ role: 'NGO' }).select('-passwordHash');
}
