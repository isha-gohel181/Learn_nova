const Course = require('../models/course.model');
const Progress = require('../models/progress.model');
const Review = require('../models/review.model');
const Lesson = require('../models/lesson.model');
const User = require('../models/user.model');

class ReportController {
  // Get course analytics
  async getCourseAnalytics(req, res, next) {
    try {
      const { courseId } = req.params;

      const course = await Course.findById(courseId);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found',
        });
      }

      // Check if user is instructor
      if (course.instructorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Only course instructor can view analytics',
        });
      }

      // Get enrollment count
      const enrollmentCount = course.enrolledUsers.length;

      // Get progress data
      const progressData = await Progress.find({ courseId });
      const completedCount = progressData.filter((p) => p.status === 'completed').length;
      const inProgressCount = progressData.filter((p) => p.status === 'in_progress').length;

      const avgProgress = progressData.length > 0 ? Math.round(progressData.reduce((sum, p) => sum + p.progressPercent, 0) / progressData.length) : 0;

      // Get review data
      const reviews = await Review.find({ courseId });
      const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0;

      // Get lessons count
      const lessonsCount = await Lesson.countDocuments({ courseId });

      // Get top learners
      const topLearners = await Progress.find({ courseId, status: 'completed' })
        .populate('userId', 'name badge points')
        .sort({ completedDate: -1 })
        .limit(10);

      res.status(200).json({
        success: true,
        message: 'Analytics fetched successfully',
        data: {
          course: {
            title: course.title,
            totalLessons: lessonsCount,
            createdAt: course.createdAt,
          },
          enrollment: {
            total: enrollmentCount,
            completed: completedCount,
            inProgress: inProgressCount,
            notStarted: enrollmentCount - completedCount - inProgressCount,
            completionRate: enrollmentCount > 0 ? Math.round((completedCount / enrollmentCount) * 100) : 0,
          },
          avgProgress,
          reviews: {
            average: parseFloat(avgRating),
            total: reviews.length,
          },
          topLearners,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Get learner progress report
  async getLearnerProgressReport(req, res, next) {
    try {
      const userId = req.user._id;

      // Get user info
      const user = await User.findById(userId);

      // Get all progress
      const progressData = await Progress.find({ userId })
        .populate('courseId', 'title instructorId')
        .populate('completedLessons');

      const totalCourses = progressData.length;
      const completedCourses = progressData.filter((p) => p.status === 'completed').length;
      const inProgressCourses = progressData.filter((p) => p.status === 'in_progress').length;

      const totalLessonsCompleted = progressData.reduce((sum, p) => sum + p.completedLessons.length, 0);
      const avgProgress = totalCourses > 0 ? Math.round(progressData.reduce((sum, p) => sum + p.progressPercent, 0) / totalCourses) : 0;

      // Get user reviews
      const reviews = await Review.find({ userId });

      res.status(200).json({
        success: true,
        message: 'Learner progress report fetched successfully',
        data: {
          user: {
            name: user.name,
            email: user.email,
            badge: user.badge,
            points: user.points,
          },
          summary: {
            totalCourses,
            completedCourses,
            inProgressCourses,
            totalLessonsCompleted,
            averageProgress: avgProgress,
            totalReviews: reviews.length,
            averageReviewRating: reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0,
          },
          courseProgress: progressData,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Get instructor dashboard report
  async getInstructorDashboard(req, res, next) {
    try {
      const instructorId = req.user._id;

      // Get all instructor's courses
      const courses = await Course.find({ instructorId });
      const courseIds = courses.map((c) => c._id);

      // Get total enrollment across all courses
      let totalEnrollment = 0;
      courses.forEach((c) => {
        totalEnrollment += c.enrolledUsers.length;
      });

      // Get total completed across all courses
      const progressData = await Progress.find({ courseId: { $in: courseIds } });
      const totalCompleted = progressData.filter((p) => p.status === 'completed').length;

      // Get total reviews
      const reviews = await Review.find({ courseId: { $in: courseIds } });
      const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0;

      // Get course-wise analytics
      const courseAnalytics = await Promise.all(
        courses.map(async (course) => {
          const courseProgress = await Progress.find({ courseId: course._id });
          const courseReviews = await Review.find({ courseId: course._id });
          const lessonsCount = await Lesson.countDocuments({ courseId: course._id });

          return {
            id: course._id,
            title: course.title,
            enrollmentCount: course.enrolledUsers.length,
            completedCount: courseProgress.filter((p) => p.status === 'completed').length,
            lessonsCount,
            reviewCount: courseReviews.length,
            averageRating: courseReviews.length > 0 ? (courseReviews.reduce((sum, r) => sum + r.rating, 0) / courseReviews.length).toFixed(1) : 0,
            isPublished: course.isPublished,
          };
        })
      );

      res.status(200).json({
        success: true,
        message: 'Instructor dashboard report fetched successfully',
        data: {
          summary: {
            totalCourses: courses.length,
            publishedCourses: courses.filter((c) => c.isPublished).length,
            totalEnrollment,
            totalCompleted,
            completionRate: totalEnrollment > 0 ? Math.round((totalCompleted / totalEnrollment) * 100) : 0,
            totalReviews: reviews.length,
            averageRating: parseFloat(avgRating),
          },
          courses: courseAnalytics,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReportController();
