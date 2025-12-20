# AbleSpace - Task Collaboration Platform

AbleSpace is a modern task collaboration platform that enables teams to create, manage, and collaborate on tasks in real-time. Built with a focus on user experience and scalability, it combines a robust Node.js backend with a responsive React frontend.

## Table of Contents

- [Quick Start](#quick-start)
- [Architecture Overview](#architecture-overview)
- [Design Decisions](#design-decisions)
- [API Contract](#api-contract)
- [Socket.IO Real-Time Features](#socketio-real-time-features)
- [Trade-offs & Assumptions](#trade-offs--assumptions)

---

## Quick Start

### Prerequisites

- **Node.js** (v18+)
- **MongoDB** (local or Atlas connection string)
- **npm** or **yarn**

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create a `.env` file** in the backend root:
   ```env
   PORT=5000
   DB_URL=mongodb://localhost:27017/ablespace
   JWT_SECRET=your_secret_key_here
   JWT_EXPIRY=7d
   FRONTEND_URL=http://localhost:5173
   NODE_ENV=development
   ```

4. **Start the server:**
   ```bash
   # Development with auto-reload
   npm run dev

   # Production
   npm start
   ```

The backend will be available at `http://localhost:5000`.

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`.

### Running Tests

From the backend directory:
```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

---

## Architecture Overview

### High-Level Design

AbleSpace follows a **layered architecture** pattern, separating concerns into distinct layers:

```
Request → Router → Controller → Service → Repository → Database
```

#### Why This Approach?

1. **Maintainability**: Each layer has a single responsibility, making code easier to test and update.
2. **Testability**: Services and repositories can be mocked for unit testing without touching the database.
3. **Scalability**: Business logic is isolated, allowing for easier refactoring and feature additions.
4. **Reusability**: Services can be shared across multiple endpoints.

### Technology Stack

**Backend:**
- **Framework**: Express.js (TypeScript)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with HttpOnly cookies
- **Real-Time Communication**: Socket.IO
- **Validation**: Custom schema validation middleware
- **Testing**: Jest

**Frontend:**
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **State Management**: React Context API + React Query
- **HTTP Client**: Axios
- **Styling**: CSS with Tailwind CSS (via shadcn/ui components)
- **Form Handling**: React Hook Form

---

## Design Decisions

### 1. Database Choice: MongoDB + Mongoose

**Why MongoDB?**
- **Flexibility**: Schema-less nature allows for easy schema evolution without migrations.
- **Developer Experience**: JSON-like documents map naturally to JavaScript objects.
- **Scalability**: Built-in horizontal scaling via sharding.

**Mongoose Benefits:**
- Provides schema validation and type safety.
- Built-in middleware hooks (pre/post) for common patterns.
- Population feature for easy relationship handling.

### 2. Authentication: JWT + HttpOnly Cookies

**Architecture:**
- JWTs are generated upon login and stored in **HttpOnly cookies** (server-side only).
- **Never exposed to JavaScript** to prevent XSS attacks.
- Automatically sent with every request via `credentials: 'include'`.

**Why This Approach?**
- **Security**: HttpOnly cookies are inaccessible to JavaScript, protecting against XSS token theft.
- **Convenience**: No need to manually manage token storage or headers.
- **CSRF Protection**: Can be combined with CSRF tokens if needed.

**Flow:**
```
1. User submits login credentials
2. Server validates and issues JWT → stored in HttpOnly cookie
3. Browser automatically includes cookie in subsequent requests
4. Middleware verifies JWT from cookie
5. On logout, server clears the cookie
```

### 3. Service Layer Pattern

**Why Services?**
- **Business Logic Isolation**: All business rules are in one place.
- **Testability**: Easy to mock dependencies and write unit tests.
- **Reusability**: Same service logic can be called from different controllers or Socket events.

**Example: TaskService**
```typescript
// Controller delegates to service
const task = await TaskService.createTask(userId, taskData);

// Service encapsulates business logic
TaskService.createTask(userId, taskData) {
  // Validation, transformation, and repository calls
  return this.taskRepository.create({ ...taskData, owner: userId });
}
```

### 4. Repository Pattern

**Why Repositories?**
- **Data Abstraction**: Controllers and services don't know about database implementation.
- **Easy Testing**: Mock repositories for unit tests.
- **Future-Proof**: Switching from MongoDB to PostgreSQL requires changing only the repository.

**CRUD Operations:**
```typescript
// Generic CRUD operations
create(data)
findById(id)
findAll(filters)
update(id, data)
delete(id)
```

### 5. API Versioning

Currently supporting `/api/v1/` with `/api/v2/` infrastructure ready for future enhancements.

**Rationale:**
- Allows breaking changes without disrupting existing clients.
- Smooth migration path for API consumers.
- Parallel operation of multiple API versions.

---

## API Contract

### Authentication Endpoints

#### Sign Up
```http
POST /api/v1/users/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "username": "johndoe",
  "password": "securePassword123"
}

Response: 201 Created
{
  "user": {
    "_id": "user123",
    "name": "John Doe",
    "email": "john@example.com",
    "username": "johndoe",
    "avatar": null
  },
  "token": "eyJhbGc..." // Stored in HttpOnly cookie
}
```

#### Sign In
```http
POST /api/v1/users/signin
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}

Response: 200 OK
{
  "user": { ... },
  "token": "eyJhbGc..."
}
```

#### Logout
```http
POST /api/v1/users/logout
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Logged out successfully"
}
```

### User Endpoints

#### Get Profile
```http
GET /api/v1/users/profile
Authorization: Bearer <token>

Response: 200 OK
{
  "_id": "user123",
  "name": "John Doe",
  "email": "john@example.com",
  "username": "johndoe",
  "avatar": null
}
```

#### Update Profile
```http
PUT /api/v1/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "avatar": "https://example.com/avatar.jpg"
}

Response: 200 OK
{ ... updated user data ... }
```

#### Search Users
```http
GET /api/v1/users/search?query=john
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "_id": "user123",
    "name": "John Doe",
    "email": "john@example.com",
    "username": "johndoe"
  }
]
```

#### Get User by ID
```http
GET /api/v1/users/:userId
Authorization: Bearer <token>

Response: 200 OK
{ ... user data ... }
```

### Task Endpoints

#### Create Task
```http
POST /api/v1/tasks/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Design landing page",
  "description": "Create a modern landing page design",
  "priority": "high",
  "dueDate": "2025-12-31",
  "tags": ["design", "frontend"]
}

Response: 201 Created
{
  "_id": "task123",
  "title": "Design landing page",
  "description": "Create a modern landing page design",
  "priority": "high",
  "status": "to-do",
  "owner": "user123",
  "dueDate": "2025-12-31",
  "tags": ["design", "frontend"],
  "collaborators": [],
  "createdAt": "2025-12-20T10:30:00Z",
  "updatedAt": "2025-12-20T10:30:00Z"
}
```

#### Get User's Tasks
```http
GET /api/v1/tasks/user
Authorization: Bearer <token>

Response: 200 OK
[
  { ... task data ... },
  { ... task data ... }
]
```

#### Get Tasks Assigned to User
```http
GET /api/v1/tasks/assigned
Authorization: Bearer <token>

Response: 200 OK
[ ... assigned tasks ... ]
```

#### Get Task Details
```http
GET /api/v1/tasks/:taskId
Authorization: Bearer <token>

Response: 200 OK
{ ... full task data with collaborators ... }
```

#### Update Task
```http
PUT /api/v1/tasks/:taskId
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated title",
  "description": "Updated description",
  "priority": "medium",
  "dueDate": "2025-12-25",
  "tags": ["new", "tag"]
}

Response: 200 OK
{ ... updated task data ... }
```

#### Update Task Status
```http
PATCH /api/v1/tasks/:taskId/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "in-progress"
}

Valid statuses: "to-do", "in-progress", "completed"

Response: 200 OK
{ ... updated task with new status ... }
```

#### Add Collaborator
```http
POST /api/v1/tasks/:taskId/collaborators/add
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user456"
}

Response: 200 OK
{ ... task with new collaborator ... }
```

#### Remove Collaborator
```http
POST /api/v1/tasks/:taskId/collaborators/remove
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user456"
}

Response: 200 OK
{ ... task with collaborator removed ... }
```

#### Delete Task
```http
DELETE /api/v1/tasks/:taskId
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Task deleted successfully"
}
```

### Health Check
```http
GET /api/v1/ping

Response: 200 OK
{
  "message": "Server is running"
}
```

---

## Socket.IO Real-Time Features

### Purpose

Socket.IO enables real-time updates across all connected clients when tasks are modified. This ensures that team members see changes instantly without refreshing the page.

### Architecture

**Connection Flow:**
1. Frontend connects to Socket.IO server on app load.
2. User joins a personal room: `user-{userId}` for receiving notifications.
3. When a task is updated, backend emits events to relevant users.
4. Frontend listens for events and updates state accordingly.

### Key Events

#### Task Update Events
```javascript
// Frontend listens for task updates
socket.on('task:updated', (data) => {
  // Update task in local state
  updateTaskInCache(data.task);
});

// Backend emits when a task is modified
io.to(`user-${collaboratorId}`).emit('task:updated', {
  taskId: '123',
  task: { ... updated task data ... }
});
```

#### Task Created Events
```javascript
// Notify team members when a new task is created
io.to(`user-${teamMemberId}`).emit('task:created', {
  task: { ... new task data ... }
});
```

#### Collaboration Notifications
```javascript
// Notify when user is added as collaborator
io.to(`user-${newCollaboratorId}`).emit('task:collaborator-added', {
  taskId: '123',
  addedBy: 'user456',
  task: { ... task data ... }
});
```

### Real-Time Flow Example

```
1. User A modifies task status to "in-progress"
   ↓
2. Frontend sends PATCH request to /api/v1/tasks/:id/status
   ↓
3. Backend updates MongoDB and gets updated task
   ↓
4. TaskService/Controller emits task:updated to all collaborators
   ↓
5. User B receives event via Socket.IO and updates local state
   ↓
6. User B's UI reflects the change instantly
```

### Socket Connection Management

**Connection:**
```typescript
// Frontend
const socket = io(import.meta.env.VITE_API_URL, {
  withCredentials: true // Include cookies
});

socket.emit('join_user_room', { userId: currentUser._id });
```

**Disconnection:**
```typescript
// Cleanup on logout or app unload
socket.emit('leave_user_room', { userId: currentUser._id });
socket.disconnect();
```

---

## Trade-offs & Assumptions

### Trade-offs Made

#### 1. **Stateless vs Stateful Socket Connections**
- **Choice**: Stateless (no session persistence)
- **Reasoning**: Simpler implementation, easier to scale horizontally
- **Trade-off**: Users must reconnect after server restart
- **Alternative**: Redis-backed sessions for production scale

#### 2. **Authorization in Sockets**
- **Current**: Basic room-based isolation via userId
- **Challenge**: No explicit permission checks on socket events
- **Assumption**: Socket events are routed through HTTP requests first
- **Future**: Add explicit permission middleware for socket handlers

#### 3. **Database Choice (MongoDB)**
- **Advantage**: Flexible schema, easy to iterate
- **Trade-off**: No ACID transactions (pre-7.0), potential data consistency issues
- **Assumption**: Data consistency is less critical than scalability
- **Alternative**: PostgreSQL for stricter consistency requirements

#### 4. **HTTP + Socket.IO Hybrid Approach**
- **Why**: REST API for CRUD + Socket.IO for real-time notifications
- **Trade-off**: Maintaining two communication patterns
- **Benefit**: Familiar REST API for standard operations + real-time updates

#### 5. **React Query for Caching**
- **Purpose**: Reduce server requests and improve UX
- **Trade-off**: Client-side state can become stale if real-time updates are missed
- **Mitigation**: Socket events trigger cache invalidation

### Assumptions

1. **Internet Connectivity**: Users maintain stable connections. Offline handling is not implemented.

2. **Trust Model**: All authenticated users can view each other's profiles (search functionality is open to all authenticated users).

3. **Task Ownership**: Only the task owner can delete tasks. Collaborators cannot delete but can modify status.

4. **Single Device**: User sessions are not device-aware. Logging in on a new device overwrites the previous session.

5. **Real-Time Expectations**: Users expect Socket events within 1-2 seconds. This is acceptable for most use cases but not for ultra-low-latency requirements.

6. **Scalability**: Current implementation is suitable for ~1,000 concurrent users. Horizontal scaling requires:
   - Redis adapter for Socket.IO
   - Database replication/sharding
   - Load balancer configuration

### Future Improvements

- **Offline Support**: Queue operations and sync when reconnected
- **Message Notifications**: Extend Socket.IO for task comments/discussions
- **Activity Feed**: Real-time activity log for tasks
- **Permission Granularity**: Role-based access control (viewer, editor, admin)
- **Audit Logging**: Track all task modifications with user attribution
- **File Attachments**: Upload files to tasks with real-time sync

---

## Development Guidelines

### Adding a New Endpoint

1. **Create a router** in `src/routers/v1/`:
   ```typescript
   router.post('/endpoint', isAuthenticated, validateRequestBody(schema), Controller.method);
   ```

2. **Implement the controller** in `src/controllers/`:
   ```typescript
   static async method(req: Request, res: Response) {
     const result = await Service.method(req.body);
     res.status(200).json(result);
   }
   ```

3. **Add business logic** in `src/services/`:
   ```typescript
   async method(data) {
     // Validation and transformation
     return this.repository.operation(data);
   }
   ```

4. **Add repository method** in `src/repositories/`:
   ```typescript
   async operation(data) {
     return await Model.create(data);
   }
   ```

5. **Write tests** in `src/__tests__/`:
   ```typescript
   test('should perform operation', async () => {
     const result = await Service.method(mockData);
     expect(result).toEqual(expectedResult);
   });
   ```

### Code Style

- Use TypeScript strict mode
- Prefer `const` over `let`, avoid `var`
- Use meaningful variable names
- Write minimal, focused functions
- Add error handling with custom AppError class

---

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check MongoDB is running
mongosh

# Verify connection string in .env
DB_URL=mongodb://localhost:27017/ablespace
```

### Socket.IO Not Connecting
- Verify `FRONTEND_URL` in backend `.env`
- Check CORS is enabled in server setup
- Ensure socket connection is created in frontend

### Tests Failing
```bash
# Clear Jest cache
npm test -- --clearCache

# Run with verbose output
npm test -- --verbose
```

---

## License

MIT

---

## Support

For issues or questions, please open an issue in the repository or contact the development team.
