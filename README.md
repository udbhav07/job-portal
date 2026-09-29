# JobPortal

A mini project to revise my MERN stack concepts. Live at [jobportal.udbhavsai.com](https://jobportal.udbhavsai.com).

A job board with two sides. Job seekers search for jobs, save them, apply with their resume and follow each application's status. Employers post jobs, review applicants, move them through Applied, In Review, Accepted or Rejected, and see their hiring numbers on a dashboard.

## What it does

Job seekers can filter jobs by keyword, location, category, type and salary, then apply in one click. The resume on their profile goes with the application.

Employers can create, edit, close and delete job posts. Each post lists its applicants with their profile and resume, and the dashboard shows active jobs, applicants and hires along with the trend over the last week.

Resumes are private. Only the job seeker and the employers they applied to can open one.

## Stack

The frontend is React with Vite and Tailwind CSS. The backend is Node.js with Express, MongoDB through Mongoose, and JWT for login. Profile pictures, company logos and resumes are stored in Backblaze B2.

## Run it locally

You need Node.js, a MongoDB database and a Backblaze B2 bucket.

```bash
# backend: copy .env.example to .env and fill in the values
cd backend
npm install
npm run dev

# frontend: create frontend/.env with VITE_API_URL=http://localhost:7999
cd frontend
npm install
npm run dev
```

The backend reads its settings from `backend/.env`. See `backend/.env.example` for the full list.
