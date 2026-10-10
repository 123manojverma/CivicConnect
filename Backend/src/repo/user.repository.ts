import { IUser, User } from "../models/User";

class UserRepository {
    async create(data: Partial<IUser>) {
        const user = new User(data);
        return await user.save();
    }

    async findByEmail(email: string) {
        return await User.findOne({ email });
    }

    async findById(id: string) {
        return await User.findById(id).select('-passwordHash');
    }

    async findNearbyNGOs(longitude: number, latitude: number, maxDistance: number = 10000, category?: string) {
        const query: Record<string, any> = {
            role: 'NGO',
            location: {
                $near: {
                    $geometry: { type: 'Point', coordinates: [longitude, latitude] },
                    $maxDistance: maxDistance
                }
            }
        };
        if (category) {
            query.categories = { $in: [category] };
        }
        return await User.find(query).select('-passwordHash');
    }

    async findNGOsByWard(wardId: string) {
        return await User.find({ role: 'NGO', wardId }).select('-passwordHash');
    }

    async updateById(id: string, data: Partial<IUser>) {
        return await User.findByIdAndUpdate(id, data, { new: true }).select('-passwordHash');
    }
}

export const userRepository = new UserRepository();
