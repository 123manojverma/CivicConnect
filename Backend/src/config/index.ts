// This file contains all the basic configuration logic for the app server to work
import dotenv from 'dotenv';

type ServerConfig = {
    PORT: number,
    MONGO_URL:string
}

function loadEnv() {
    dotenv.config();
    console.log(`Environment variables loaded`);
}

loadEnv();


export const serverConfig: ServerConfig = {
    PORT: Number(process.env.PORT) || 3001,
    MONGO_URL: process.env.MONGO_URL || "mongodb://localhost:27017"
};