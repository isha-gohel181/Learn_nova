const express = require('express');
const courseController = require('../controllers/course.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

// Public routes
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);

// Protected routes - Learner
router.post('/:id/enroll', authMiddleware, roleMiddleware('learner'), courseController.enrollCourse);
router.get('/learner/my-courses', authMiddleware, roleMiddleware('learner'), courseController.getLearnerCourses);

// Protected routes - Instructor
const courseUpload = upload.fields([
	{ name: 'banner', maxCount: 1 },
	{ name: 'introVideo', maxCount: 1 },
]);

router.post('/', authMiddleware, roleMiddleware('instructor'), courseUpload, courseController.createCourse);
router.put('/:id', authMiddleware, roleMiddleware('instructor'), courseUpload, courseController.updateCourse);
router.delete('/:id', authMiddleware, roleMiddleware('instructor'), courseController.deleteCourse);
router.patch('/:id/publish', authMiddleware, roleMiddleware('instructor'), courseController.publishCourse);
router.get('/instructor/my-courses', authMiddleware, roleMiddleware('instructor'), courseController.getInstructorCourses);

module.exports = router;
