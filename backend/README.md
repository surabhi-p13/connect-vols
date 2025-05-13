
# Connect Vols Backend API

This is the backend API for the Connect Vols application, a platform to streamline volunteer engagement and project coordination for non-profit organizations.

## Features

- User authentication and management
- Project creation and management
- Volunteer applications and tracking
- Real-time notifications and chat
- Search and matching algorithm
- Analytics and reporting

## Prerequisites

- Node.js (v18 or later)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies:

```bash
npm install
# or
yarn install
```

4. Copy the `.env.example` file to `.env` and update the environment variables:

```bash
cp .env.example .env
```

5. Start the development server:

```bash
npm run dev
# or
yarn dev
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/google` - Login with Google
- `GET /api/auth/me` - Get current user

### Users

- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `POST /api/users/:id/resume` - Upload resume
- `POST /api/users/:id/profile-image` - Upload profile image
- `GET /api/users` - Get all users (admin only)

### Projects

- `POST /api/projects` - Create new project
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/image` - Upload project image

### Applications

- `POST /api/applications` - Apply to project
- `GET /api/applications/my-applications` - Get user's applications
- `GET /api/applications/:id` - Get application details
- `PUT /api/applications/:id/status` - Update application status
- `PUT /api/applications/:id/hours` - Add volunteer hours

### Search

- `GET /api/search/projects` - Search projects
- `GET /api/search/volunteers` - Search volunteers
- `GET /api/search/nearby` - Find nearby projects
- `GET /api/search/recommendations` - Get recommended projects

### Notifications

- `GET /api/notifications` - Get user's notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read
- `DELETE /api/notifications/:id` - Delete notification

### Chat

- `POST /api/chat` - Send message
- `GET /api/chat/conversation/:userId` - Get conversation
- `GET /api/chat/conversations` - Get list of conversations
- `PUT /api/chat/read/:userId` - Mark messages as read
- `DELETE /api/chat/conversation/:userId` - Delete conversation

### Analytics

- `GET /api/analytics/user/:id` - Get user's volunteer stats
- `GET /api/analytics/organization` - Get organization stats
- `GET /api/analytics/project/:id` - Get project analytics
- `GET /api/analytics/match/:projectId` - Get AI matching recommendations

## Real-time Features

The backend uses Socket.IO for real-time features:

- Chat messages
- Notifications
- Online status

## File Structure

```
backend/
├── server.js         - Entry point
├── routes/           - API route definitions
├── models/           - Mongoose models
├── middleware/       - Custom middleware
├── sockets/          - Socket.IO handlers
├── uploads/          - Uploaded files
├── .env              - Environment variables
└── package.json      - Project dependencies
```

## License

ISC
