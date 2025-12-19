// This file contains all the basic configuration logic for the app server to work
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

type ServerConfig = {
    PORT: number,
    JWT_SECRET: jwt.Secret,
    JWT_EXPIRY: string,
    DB_URL: string
}

function loadEnv() {
    dotenv.config();
    console.log(`Environment variables loaded`);
}

loadEnv();

export const serverConfig: ServerConfig = {
    PORT: Number(process.env.PORT) || 3001,
    JWT_SECRET: process.env.JWT_SECRET || 'defaultsecret',
    JWT_EXPIRY: process.env.JWT_EXPIRY || '1h',
    DB_URL: process.env.DB_URL || 'mongodb://localhost:27017/user_db'
};