const express = require('express');
const progressController = require('../controllers/progress.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

const router = express.Router();

// Protected routes - Learner only
router.post('/update', authMiddleware, roleMiddleware('learner'), progressController.updateProgress);
router.get('/stats', authMiddleware, roleMiddleware('learner'), progressController.getProgressStats);
router.get('/', authMiddleware, roleMiddleware('learner'), progressController.getAllProgress);
router.get('/:courseId', authMiddleware, roleMiddleware('learner'), progressController.getProgressByCourse);

module.exports = router;
