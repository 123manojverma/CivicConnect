import dotenv from 'dotenv';

type ServerConfig = {
    PORT: number,
    MONGO_URL: string,
    JWT_SECRET: string,
    CLOUDINARY_CLOUD_NAME: string,
    CLOUDINARY_API_KEY: string,
    CLOUDINARY_API_SECRET: string,
    GEMINI_API_KEY: string,
    CLIENT_URL: string
}

function loadEnv() {
    dotenv.config();
}

loadEnv();

export const serverConfig: ServerConfig = {
    PORT: Number(process.env.PORT) || 3001,
    MONGO_URL: process.env.MONGO_URL || "mongodb://localhost:27017",
    JWT_SECRET: process.env.JWT_SECRET || "civicconnect_secret_2024",
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
    CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000"
};