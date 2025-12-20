import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cookieParser from 'cookie-parser';
import { serverConfig } from './config';
import v1Router from './routers/v1/index.router';
import v2Router from './routers/v2/index.router';
import { appErrorHandler, genericErrorHandler } from './middlewares/error.middleware';
import logger from './config/logger.config';
import { attachCorrelationIdMiddleware } from './middlewares/correlation.middleware';
import { connectDB } from './config/db.config';
import { TaskSocketHandler } from './controllers/task.socket.controller';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Make io available globally
declare global {
  namespace Express {
    interface Request {
      io?: Server;
    }
  }
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());

// Attach io to request object for controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

/**
 * Socket.io connection handler
 */
io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id}`);
  
  // Register task socket handlers
  TaskSocketHandler(io, socket);
});

/**
 * Registering all the routers and their corresponding routes with out app server object.
 */

app.use(attachCorrelationIdMiddleware);
app.use('/api/v1', v1Router);
app.use('/api/v2', v2Router); 


/**
 * Add the error handler middleware
 */

app.use(appErrorHandler);
app.use(genericErrorHandler);


httpServer.listen(serverConfig.PORT, () => {
    logger.info(`Server is running on http://localhost:${serverConfig.PORT}`);
    logger.info(`WebSocket server is ready for connections`);
    logger.info(`Press Ctrl+C to stop the server.`);
});

// Connect to database after server starts listening
connectDB().catch((error) => {
    logger.error("Failed to start server due to database connection error", { error });
    process.exit(1);
});
