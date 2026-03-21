const express = require('express');
const reportController = require('../controllers/report.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

const router = express.Router();

// Protected routes - Instructor only
router.get('/course/:courseId', authMiddleware, roleMiddleware('instructor'), reportController.getCourseAnalytics);
router.get('/dashboard', authMiddleware, roleMiddleware('instructor'), reportController.getInstructorDashboard);

// Protected routes - Learner
router.get('/learner/progress-report', authMiddleware, roleMiddleware('learner'), reportController.getLearnerProgressReport);

module.exports = router;
