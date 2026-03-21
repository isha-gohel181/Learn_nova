const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./db/db');

// Import routes
const authRoute = require('./routes/auth.route');
const courseRoute = require('./routes/course.route');
const lessonRoute = require('./routes/lesson.route');
const quizRoute = require('./routes/quiz.route');
const progressRoute = require('./routes/progress.route');
const reviewRoute = require('./routes/review.route');
const reportRoute = require('./routes/report.route');

// Import middleware
const errorMiddleware = require('./middleware/error.middleware');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

// Connect to Database
connectDB();

// Health check route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Learnova eLearning API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoute);
app.use('/api/courses', courseRoute);
app.use('/api/lessons', lessonRoute);
app.use('/api/quiz', quizRoute);
app.use('/api/progress', progressRoute);
app.use('/api/reviews', reviewRoute);
app.use('/api/reports', reportRoute);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// Global error handler
app.use(errorMiddleware);

module.exports = app;