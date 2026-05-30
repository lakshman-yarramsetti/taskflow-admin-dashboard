# TaskFlow Admin Dashboard

TaskFlow Admin Dashboard is a React frontend for the TaskFlow RBAC API. It demonstrates a complete full-stack workflow with JWT login, role-based navigation, task management, user management, manager-team visibility, and API integration.

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
- Axios interceptor for authenticated API requests
- Role-based sidebar navigation
- Overview page with visible task metrics
- Recent tasks table with task title, description, status, assigned user, and creator
- Task list with search and status filtering
- Task creation for admin and manager users
- Task status updates
- Admin user management with role changes and manager assignment
- Manager team view with read-only employee list
- Employee-focused task view without user management screens
- Toast messages, loading states, placeholders, and responsive tables

## Role-Based UI Behavior

### Admin

- Can see Overview, Tasks, and Users screens
- Can create users
- Can assign employees to managers
- Can change user roles
- Can create and update tasks
- Can see all users and tasks

### Manager

- Can see Overview, Tasks, and Users screens
- Can view only employees assigned under them
- Can create tasks for their own team members
- Can update related task statuses
- Cannot create users
- Cannot change roles
- Cannot assign managers

### Employee

- Can see Overview and Tasks screens
- Can view and update only assigned tasks
- Cannot see the Users screen
- Cannot create tasks or users

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

Default frontend URL:

```text
http://localhost:5173
```

## Build

```bash
npm run build
```

## Implementation Notes

The dashboard stores the JWT token and logged-in user details after login, then attaches the token to API requests through an Axios interceptor.

The backend controls the real security rules. The frontend mirrors those rules in the UI so each role sees only the screens and controls that make sense for them.

For task people columns, the dashboard displays `You` when the logged-in user is the assigned user or task creator. Otherwise, it shows the user name returned by the API.
