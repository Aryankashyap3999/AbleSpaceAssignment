import { Socket, Server } from 'socket.io';
import { TASK_EVENTS, NOTIFICATION_EVENTS } from '../utils/common/socketEvents';

const userSockets = new Map<string, string>(); // userId -> socketId

export const TaskSocketHandler = (io: Server, socket: Socket) => {
  // Join task room when user connects
  socket.on(TASK_EVENTS.JOIN_TASK_ROOM, (data: { userId: string }) => {
    const { userId } = data;
    userSockets.set(userId, socket.id);
    
    // Join a room named after the user for personal notifications
    socket.join(`user-${userId}`);
    
    console.log(`User ${userId} joined task room with socket ${socket.id}`);
  });

  // Leave task room when user disconnects
  socket.on(TASK_EVENTS.LEAVE_TASK_ROOM, (data: { userId: string }) => {
    const { userId } = data;
    userSockets.delete(userId);
    socket.leave(`user-${userId}`);
    
    console.log(`User ${userId} left task room`);
  });

  // Handle socket disconnection
  socket.on('disconnect', () => {
    // Remove user from map
    for (const [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        break;
      }
    }
    console.log(`Socket ${socket.id} disconnected`);
  });
};

// Helper function to emit task updates to all connected users
export const emitTaskUpdate = (
  io: Server,
  eventType: string,
  taskData: any
) => {
  io.emit(eventType, taskData);
};

// Helper function to send assignment notification to a specific user
export const sendAssignmentNotification = (
  io: Server,
  assignedToId: string,
  taskData: any
) => {
  io.to(`user-${assignedToId}`).emit(NOTIFICATION_EVENTS.ASSIGNMENT_NOTIFICATION, {
    type: 'task_assigned',
    task: taskData,
    message: `You have been assigned a new task: ${taskData.title}`,
    timestamp: new Date(),
  });
};
