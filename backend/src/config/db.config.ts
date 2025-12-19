import mongoose from 'mongoose';
import { serverConfig } from './index';
import logger from './logger.config';

export const connectDB = async () => {
    try {

        const DB_URL = serverConfig.DB_URL;
        await mongoose.connect(DB_URL);
        logger.info("Connected to the database successfully");

        mongoose.connection.on("error", (err) => {
            logger.error("MongoDB connection error", { error: err });
        });

        mongoose.connection.on("disconnected", () => {
            logger.warn("MongoDB disconnected");
        })

        process.on("SIGINT", async () => {      
            await mongoose.connection.close();
            logger.info("MongoDB connection closed due to application termination");
            process.exit(0);
        });
        
    } catch (error) {
        logger.error("Failed to connect to the database", { error });
        process.exit(1);
    }
}