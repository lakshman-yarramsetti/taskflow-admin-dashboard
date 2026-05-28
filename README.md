# TaskFlow Admin Dashboard

TaskFlow Admin Dashboard is a React frontend for the TaskFlow RBAC API. It demonstrates a full-stack workflow with JWT login, role-based navigation, task management, user role management, and API integration.

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide React

## Features

- Login with TaskFlow API credentials
- Protected routes using local auth context
- Overview page with task status metrics
- Task list with search and status filtering
- Task creation for admin and manager users
- Task status updates
- User role management for admin users
- Responsive dashboard layout

## API Dependency

This frontend expects the backend API to run from the TaskFlow RBAC API project.

Default backend URL:

```env
VITE_API_BASE_URL=http://localhost:3000
```

Create a `.env` file from `.env.example` if your API runs on a different port.

## Local Setup

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Implementation Notes

The dashboard stores the JWT token and user details after login, then attaches the token to API requests through an Axios interceptor. Routes are protected with `ProtectedRoute`, while screen-level behavior changes based on the logged-in user's role.

Admins can manage users, managers can create tasks, and employees can focus on assigned work. This frontend is intentionally connected to the NestJS RBAC backend to demonstrate a complete full-stack flow.
