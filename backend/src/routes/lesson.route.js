const express = require('express');
const lessonController = require('../controllers/lesson.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

const router = express.Router();

// Public routes
router.get('/:courseId', lessonController.getLessonsByCourse);
router.get('/lesson/:id', lessonController.getLessonById);

// Protected routes - Instructor
router.post('/', authMiddleware, roleMiddleware('instructor'), lessonController.createLesson);
router.put('/:id', authMiddleware, roleMiddleware('instructor'), lessonController.updateLesson);
router.delete('/:id', authMiddleware, roleMiddleware('instructor'), lessonController.deleteLesson);
router.patch('/:id/publish', authMiddleware, roleMiddleware('instructor'), lessonController.publishLesson);

// Protected routes - Learner
router.post('/complete', authMiddleware, roleMiddleware('learner'), lessonController.markLessonComplete);

module.exports = router;
