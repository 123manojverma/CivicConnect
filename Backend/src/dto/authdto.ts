export interface RegisterDTO {
    name: string;
    email: string;
    password: string;
    role: 'Citizen' | 'Government' | 'NGO';
    wardId?: string;
    organizationName?: string;
    phone?: string;
    latitude?: number;
    longitude?: number;
    categories?: string[];
}

export interface LoginDTO {
    email: string;
    password: string;
}
