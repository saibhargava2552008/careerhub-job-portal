# CareerHub — Job Portal

CareerHub is a student full-stack project where job seekers can browse jobs and apply, while recruiters can publish jobs and manage applications.

## Features

### Job seekers
- Register and log in securely
- Search jobs by title, company, and location
- View job details
- Apply with a resume link
- View application status
- Duplicate applications are blocked

### Recruiters
- Register and log in as a recruiter
- Post jobs
- View applicants for jobs they own
- Update application statuses (Applied, Shortlisted, Rejected, Selected)
- Edit or delete only their own jobs through the protected API

## Tech stack

- Frontend: HTML, CSS, vanilla JavaScript
- Backend: Node.js, Express
- Database: MongoDB with Mongoose
- Authentication: JSON Web Tokens (JWT) and bcrypt

> The frontend uses vanilla JavaScript rather than React, so this is not a traditional MERN stack application.

## Project structure

```text
CareerHub/
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── assets/
│   ├── css/
│   ├── js/
│   ├── pages/
│   └── index.html
├── .gitignore
└── README.md
```

## Setup

### 1. Requirements
Install Node.js and MongoDB. Start your local MongoDB service.

### 2. Configure environment variables
Open a terminal in the `backend` folder and create a local `.env` file by copying `.env.example`. Set `MONGODB_URI` and replace `JWT_SECRET` with a long, random secret. Never commit `.env`.

### 3. Install backend dependencies and start the server

```bash
cd backend
npm install
npm start
```

The API runs at `http://localhost:5000`.

### 4. Open the frontend
Open `frontend/index.html` in your browser. The frontend is configured to call the local API at `http://localhost:5000`.

## Main API routes

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a job seeker or recruiter |
| POST | `/api/auth/login` | Log in and receive a JWT |
| GET | `/api/jobs` | List jobs |
| GET | `/api/jobs/:id` | View one job |
| POST | `/api/jobs` | Create a job (recruiter only) |
| PUT | `/api/jobs/:id` | Update an owned job (recruiter only) |
| DELETE | `/api/jobs/:id` | Delete an owned job (recruiter only) |
| POST | `/api/applications` | Apply for a job (job seeker only) |
| GET | `/api/applications/my` | View own applications (job seeker only) |
| GET | `/api/applications/job/:jobId` | View applicants for an owned job (recruiter only) |
| PUT | `/api/applications/:id` | Update status for an owned job's application (recruiter only) |

## Security notes

- Passwords are hashed with bcrypt.
- Protected routes verify JWTs.
- Role and job-ownership checks are performed by the backend, not just by hiding frontend controls.
- `.env` and dependency folders are excluded from Git.

## Future improvements

- Resume file uploads
- Pagination and advanced filters
- Automated integration tests
- Deployment configuration

## License

For educational use.
