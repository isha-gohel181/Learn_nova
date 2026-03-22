# Learnova

A full-stack eLearning platform for instructors and learners to create courses, manage lessons and quizzes, track progress, and review performance through role-based dashboards.

---

## Team Members

| # | Name | Role |
|---|------|------|
| 1 | **Isha Gohel** | Team Leader |
| 2 | Pooja Solanki | Team Member |
| 3 | Dhatri Patel | Team Member |

---

## Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS 4
- shadcn/ui
- React Router DOM
- Framer Motion
- Lucide React
- Sonner

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (jsonwebtoken)
- bcryptjs
- Multer (file uploads)

---

## Features

- Authentication and authorization with JWT
- Role-based access control (Learner/Instructor)
- Course creation, update, publishing, and enrollment
- Lesson management and lesson completion tracking
- Quiz creation, publishing, submission, and results
- Reviews and ratings for courses
- Learner progress statistics and reports
- Instructor course analytics and dashboard insights

---

## Project Structure

```text
Learn_nova/
├── backend/
│   ├── server.js
│   ├── seed.js
│   └── src/
│       ├── app.js
│       ├── controllers/
│       ├── db/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       └── utils/
├── frontend/
│   ├── index.html
│   ├── package.json
│   └── src/
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       └── pages/
└── README.md
```

---

## Prerequisites

- Node.js (v18+ recommended)
- npm
- MongoDB (local or Atlas)

---

## Installation

### 1) Clone repository

```bash
git clone <your-repository-url>
cd Learn_nova
```

### 2) Setup backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/learnova
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
BCRYPT_ROUNDS=10
```

### 3) Setup frontend

```bash
cd ../frontend
npm install
```

Create a `.env` file in `frontend/` (optional, default is already localhost:5000):

```env
VITE_API_URL=http://localhost:5000
```

---

## Running the Application

### Start backend

```bash
cd backend
npm run dev
```

Backend runs at: `http://localhost:5000`

### Start frontend

```bash
cd frontend
npm run dev
```

Frontend runs at: `http://localhost:5173`

### Seed database (optional)

```bash
cd backend
node seed.js
```

---

## API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get logged-in user profile

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Create course (Instructor)
- `PUT /api/courses/:id` - Update course (Instructor)
- `DELETE /api/courses/:id` - Delete course (Instructor)
- `PATCH /api/courses/:id/publish` - Publish/Unpublish course (Instructor)
- `GET /api/courses/instructor/my-courses` - Instructor courses
- `GET /api/courses/learner/my-courses` - Learner enrolled courses
- `POST /api/courses/:id/enroll` - Enroll in a course (Learner)

### Lessons
- `GET /api/lessons/:courseId` - Get lessons by course
- `GET /api/lessons/lesson/:id` - Get lesson by ID
- `POST /api/lessons` - Create lesson (Instructor)
- `PUT /api/lessons/:id` - Update lesson (Instructor)
- `DELETE /api/lessons/:id` - Delete lesson (Instructor)
- `PATCH /api/lessons/:id/publish` - Publish/Unpublish lesson (Instructor)
- `POST /api/lessons/complete` - Mark lesson complete (Learner)

### Quiz
- `POST /api/quiz` - Create quiz (Instructor)
- `GET /api/quiz/:courseId` - Get quiz by course
- `PUT /api/quiz/:courseId` - Update quiz (Instructor)
- `PATCH /api/quiz/:courseId/publish` - Publish/Unpublish quiz (Instructor)
- `POST /api/quiz/submit` - Submit quiz (Learner)
- `GET /api/quiz/results/:courseId` - Get learner quiz results

### Progress
- `POST /api/progress/update` - Update progress (Learner)
- `GET /api/progress/stats` - Progress stats (Learner)
- `GET /api/progress` - Get all learner progress
- `GET /api/progress/:courseId` - Get progress by course

### Reviews
- `GET /api/reviews/:courseId` - Get course reviews
- `POST /api/reviews` - Create review (Learner)
- `PUT /api/reviews/:id` - Update review (Learner)
- `DELETE /api/reviews/:id` - Delete review (Learner)
- `GET /api/reviews/learner/my-reviews` - Get learner reviews

### Reports
- `GET /api/reports/course/:courseId` - Course analytics (Instructor)
- `GET /api/reports/dashboard` - Instructor dashboard report
- `GET /api/reports/learner/progress-report` - Learner progress report

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|---------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Runtime environment | `development` |
| `MONGODB_URI` | MongoDB connection URI | `mongodb://127.0.0.1:27017/learnova` |
| `MONGO_URI` | Optional fallback MongoDB URI | `mongodb://127.0.0.1:27017/learnova` |
| `JWT_SECRET` | Secret key for JWT | `your_jwt_secret` |
| `JWT_EXPIRE` | JWT token expiration | `7d` |
| `BCRYPT_ROUNDS` | Password hashing rounds | `10` |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|---------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000` |

---

## Available Scripts

### Backend

| Command | Description |
|---------|-------------|
| `npm start` | Start backend in production mode |
| `npm run dev` | Start backend with nodemon |
| `node seed.js` | Seed database with sample data |

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build frontend for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## Notes

- Ensure MongoDB is running before starting backend.
- Frontend defaults to `http://localhost:5000` if `VITE_API_URL` is not set.
