const Progress = require('../models/progress.model');
const Course = require('../models/course.model');
const Lesson = require('../models/lesson.model');
const { ProgressService } = require('../services/progress.service');

class ProgressController {
  // Update progress
  async updateProgress(req, res, next) {
    try {
      const { courseId, lessonId } = req.body;

      if (!courseId || !lessonId) {
        return res.status(400).json({
          success: false,
          message: 'courseId and lessonId are required',
        });
      }

      // Check if lesson exists
      const lesson = await Lesson.findById(lessonId);
      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: 'Lesson not found',
        });
      }

      // Get or create progress
      let progress = await Progress.findOne({ userId: req.user._id, courseId });

      if (!progress) {
        progress = await Progress.create({
          userId: req.user._id,
          courseId,
          completedLessons: [lessonId],
          status: 'in_progress',
        });
      } else {
        if (!progress.completedLessons.includes(lessonId)) {
          progress.completedLessons.push(lessonId);
        }
      }

      // Update progress percent
      const updatedProgress = await ProgressService.updateProgressPercent(req.user._id, courseId);

      res.status(200).json({
        success: true,
        message: 'Progress updated successfully',
        data: {
          progressPercent: updatedProgress.progressPercent,
          status: updatedProgress.status,
          completedLessons: updatedProgress.completedLessons.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Get progress by course
  async getProgressByCourse(req, res, next) {
    try {
      const { courseId } = req.params;

      const progress = await Progress.findOne({
        userId: req.user._id,
        courseId,
      })
        .populate('courseId', 'title totalLessons')
        .populate('completedLessons', 'title type');

      if (!progress) {
        return res.status(404).json({
          success: false,
          message: 'Progress not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Progress fetched successfully',
        data: progress,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all progress for learner
  async getAllProgress(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;

      const skip = (page - 1) * limit;
      const progressList = await Progress.find({ userId: req.user._id })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('courseId', 'title image')
        .sort({ updatedAt: -1 });

      const total = await Progress.countDocuments({ userId: req.user._id });

      res.status(200).json({
        success: true,
        message: 'Progress fetched successfully',
        data: progressList,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Get progress stats for a learner
  async getProgressStats(req, res, next) {
    try {
      const progressList = await Progress.find({ userId: req.user._id });

      const total = progressList.length;
      const completed = progressList.filter((p) => p.status === 'completed').length;
      const inProgress = progressList.filter((p) => p.status === 'in_progress').length;
      const notStarted = progressList.filter((p) => p.status === 'not_started').length;

      const avgProgress = total > 0 ? Math.round(progressList.reduce((sum, p) => sum + p.progressPercent, 0) / total) : 0;

      res.status(200).json({
        success: true,
        message: 'Progress stats fetched successfully',
        data: {
          totalCourses: total,
          completedCourses: completed,
          inProgressCourses: inProgress,
          notStartedCourses: notStarted,
          averageProgress: avgProgress,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProgressController();
