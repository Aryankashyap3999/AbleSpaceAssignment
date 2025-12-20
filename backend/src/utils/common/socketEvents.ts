// Task socket events
export const TASK_EVENTS = {
  // Client to Server events
  JOIN_TASK_ROOM: 'joinTaskRoom',
  LEAVE_TASK_ROOM: 'leaveTaskRoom',
  
  // Server to Client events
  TASK_CREATED: 'taskCreated',
  TASK_UPDATED: 'taskUpdated',
  TASK_DELETED: 'taskDeleted',
  TASK_ASSIGNED: 'taskAssigned',
  TASK_STATUS_CHANGED: 'taskStatusChanged',
  TASK_PRIORITY_CHANGED: 'taskPriorityChanged',
};

// Notification events
export const NOTIFICATION_EVENTS = {
  ASSIGNMENT_NOTIFICATION: 'assignmentNotification',
  NOTIFICATION_READ: 'notificationRead',
};
