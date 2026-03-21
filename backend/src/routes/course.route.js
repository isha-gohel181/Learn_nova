const express = require('express');
const courseController = require('../controllers/course.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

const router = express.Router();

// Public routes
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);

// Protected routes - Learner
router.post('/:id/enroll', authMiddleware, roleMiddleware('learner'), courseController.enrollCourse);
router.get('/learner/my-courses', authMiddleware, roleMiddleware('learner'), courseController.getLearnerCourses);

// Protected routes - Instructor
router.post('/', authMiddleware, roleMiddleware('instructor'), courseController.createCourse);
router.put('/:id', authMiddleware, roleMiddleware('instructor'), courseController.updateCourse);
router.delete('/:id', authMiddleware, roleMiddleware('instructor'), courseController.deleteCourse);
router.patch('/:id/publish', authMiddleware, roleMiddleware('instructor'), courseController.publishCourse);
router.get('/instructor/my-courses', authMiddleware, roleMiddleware('instructor'), courseController.getInstructorCourses);

module.exports = router;
