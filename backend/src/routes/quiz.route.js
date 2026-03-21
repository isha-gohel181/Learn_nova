const express = require('express');
const quizController = require('../controllers/quiz.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

const router = express.Router();

// Create quiz - Instructor only
router.post('/', authMiddleware, roleMiddleware('instructor'), quizController.createQuiz);

// Get quiz - Public
router.get('/:courseId', quizController.getQuizByCourse);

// Submit quiz - Learner only
router.post('/submit', authMiddleware, roleMiddleware('learner'), quizController.submitQuiz);

// Get results - Learner
router.get('/results/:courseId', authMiddleware, roleMiddleware('learner'), quizController.getQuizResults);

// Update quiz - Instructor only
router.put('/:courseId', authMiddleware, roleMiddleware('instructor'), quizController.updateQuiz);

// Publish quiz - Instructor only
router.patch('/:courseId/publish', authMiddleware, roleMiddleware('instructor'), quizController.publishQuiz);

module.exports = router;
