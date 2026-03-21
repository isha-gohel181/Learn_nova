const express = require('express');
const reviewController = require('../controllers/review.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

const router = express.Router();

// Public routes
router.get('/:courseId', reviewController.getReviewsByCourse);

// Protected routes - Learner
router.post('/', authMiddleware, roleMiddleware('learner'), reviewController.createReview);
router.put('/:id', authMiddleware, roleMiddleware('learner'), reviewController.updateReview);
router.delete('/:id', authMiddleware, roleMiddleware('learner'), reviewController.deleteReview);
router.get('/learner/my-reviews', authMiddleware, roleMiddleware('learner'), reviewController.getUserReviews);

module.exports = router;
