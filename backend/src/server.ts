import express from 'express';
import { createServer } from 'http';
import { serverConfig } from './config';
import v1Router from './routers/v1/index.router';
import v2Router from './routers/v2/index.router';
import { appErrorHandler, genericErrorHandler } from './middlewares/error.middleware';
import logger from './config/logger.config';
import { attachCorrelationIdMiddleware } from './middlewares/correlation.middleware';
import { connectDB } from './config/db.config';

const app = express();
const httpServer = createServer(app);


// Make io available to other modules

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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


httpServer.listen(serverConfig.PORT, async () => {
    logger.info(`Server is running on http://localhost:${serverConfig.PORT}`);
    logger.info(`WebSocket server is ready for connections`);
    logger.info(`Press Ctrl+C to stop the server.`);
    await connectDB()
});
