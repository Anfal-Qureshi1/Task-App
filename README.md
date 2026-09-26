# Task App

A full-stack task management learning project built to practice React, REST APIs, authentication, and MongoDB-backed data.

> **Project status:** In development. The backend implements user authentication and user-scoped task CRUD endpoints. The frontend includes registration, login, and task-management UI; authentication handling for some task mutation requests is still being refined.

## What is implemented

- User registration and login
- Password hashing with `bcrypt`
- JWT-based authentication
- Tasks scoped to the authenticated user
- Create, list, update, complete/uncomplete, and delete task endpoints
- Task priority validation: `low`, `medium`, or `high`
- React frontend built with Vite
- MongoDB persistence
- Basic loading and error states

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite, CSS |
| Backend | Node.js, Express 5 |
| Database | MongoDB |
| Authentication | JSON Web Tokens (JWT), bcrypt |
| API style | REST |

## Repository structure

```text
Task-App/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── TaskItem.jsx
│   │   └── ...
│   ├── public/
│   └── package.json
├── .gitignore
└── README.md
```

## API overview

| Method | Endpoint | Purpose | Auth |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Create an account | No |
| POST | `/api/auth/login` | Sign in and receive a JWT | No |
| GET | `/api/tasks` | List the current user's tasks | Yes |
| GET | `/api/tasks/:id` | Get one task | Yes |
| POST | `/api/tasks` | Create a task | Yes |
| PATCH | `/api/tasks/:id` | Update title/completion state | Yes |
| DELETE | `/api/tasks/:id` | Delete a task | Yes |

## Run locally

### 1. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=replace_with_a_long_random_secret
PORT=5000
```

Then run:

```bash
npm start
```

### 2. Frontend

In another terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

Then run:

```bash
npm run dev
```

## Current development notes

This repository is a learning project rather than a production-ready task service. The backend protects all task routes with JWT authentication. The frontend already sends the token when loading and creating tasks; consistent authorization headers for every update/delete action are part of the remaining integration work.

Other sensible next steps include stronger form validation, automated tests, improved error feedback, and deployment configuration.

## Security

- Secrets belong in local `.env` files and should never be committed.
- Passwords are hashed before storage.
- JWT secrets should be long, random, and environment-specific.

## Author

**Anfal Qureshi**  
Computer Science student exploring full-stack development, APIs, databases, and applied software projects.
