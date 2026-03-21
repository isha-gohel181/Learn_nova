const Lesson = require('../models/lesson.model');
const Course = require('../models/course.model');
const Progress = require('../models/progress.model');

class LessonController {
  // Create lesson
  async createLesson(req, res, next) {
    try {
      const { courseId, title, type, contentUrl, duration, attachments, description, order } = req.body;

      // Validation
      if (!courseId || !title || !type || !contentUrl) {
        return res.status(400).json({
          success: false,
          message: 'CourseID, title, type, and contentUrl are required',
        });
      }

      // Check if course exists
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found',
        });
      }

      // Check if user is instructor of this course
      if (course.instructorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Only course instructor can add lessons',
        });
      }

      const lesson = await Lesson.create({
        courseId,
        title,
        type,
        contentUrl,
        duration: duration || 0,
        attachments: attachments || [],
        description: description || '',
        order: order || 0,
        isPublished: false,
      });

      // Update course total lessons
      course.totalLessons = await Lesson.countDocuments({ courseId });
      await course.save();

      res.status(201).json({
        success: true,
        message: 'Lesson created successfully',
        data: lesson,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get lessons by course ID
  async getLessonsByCourse(req, res, next) {
    try {
      const { courseId } = req.params;

      const lessons = await Lesson.find({ courseId }).sort({ order: 1 });

      if (!lessons) {
        return res.status(404).json({
          success: false,
          message: 'Lessons not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Lessons fetched successfully',
        data: lessons,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get lesson by ID
  async getLessonById(req, res, next) {
    try {
      const { id } = req.params;

      const lesson = await Lesson.findById(id);

      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: 'Lesson not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Lesson fetched successfully',
        data: lesson,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update lesson
  async updateLesson(req, res, next) {
    try {
      const { id } = req.params;
      const { title, type, contentUrl, duration, attachments, description, order } = req.body;

      const lesson = await Lesson.findById(id);

      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: 'Lesson not found',
        });
      }

      // Check authorization
      const course = await Course.findById(lesson.courseId);
      if (course.instructorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Only course instructor can update lessons',
        });
      }

      if (title) lesson.title = title;
      if (type) lesson.type = type;
      if (contentUrl) lesson.contentUrl = contentUrl;
      if (duration !== undefined) lesson.duration = duration;
      if (attachments) lesson.attachments = attachments;
      if (description) lesson.description = description;
      if (order !== undefined) lesson.order = order;

      await lesson.save();

      res.status(200).json({
        success: true,
        message: 'Lesson updated successfully',
        data: lesson,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete lesson
  async deleteLesson(req, res, next) {
    try {
      const { id } = req.params;

      const lesson = await Lesson.findById(id);

      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: 'Lesson not found',
        });
      }

      // Check authorization
      const course = await Course.findById(lesson.courseId);
      if (course.instructorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Only course instructor can delete lessons',
        });
      }

      await Lesson.findByIdAndDelete(id);

      // Update course total lessons
      course.totalLessons = await Lesson.countDocuments({ courseId: lesson.courseId });
      await course.save();

      // Remove from completed lessons in progress
      await Progress.updateMany({ courseId: lesson.courseId }, { $pull: { completedLessons: id } });

      res.status(200).json({
        success: true,
        message: 'Lesson deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // Publish/Unpublish lesson
  async publishLesson(req, res, next) {
    try {
      const { id } = req.params;
      const { isPublished } = req.body;

      const lesson = await Lesson.findById(id);

      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: 'Lesson not found',
        });
      }

      // Check authorization
      const course = await Course.findById(lesson.courseId);
      if (course.instructorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Only course instructor can publish lessons',
        });
      }

      lesson.isPublished = isPublished;
      await lesson.save();

      res.status(200).json({
        success: true,
        message: `Lesson ${isPublished ? 'published' : 'unpublished'} successfully`,
        data: lesson,
      });
    } catch (error) {
      next(error);
    }
  }

  // Mark lesson as completed
  async markLessonComplete(req, res, next) {
    try {
      const { lessonId, courseId } = req.body;

      if (!lessonId || !courseId) {
        return res.status(400).json({
          success: false,
          message: 'lessonId and courseId are required',
        });
      }

      const lesson = await Lesson.findById(lessonId);
      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: 'Lesson not found',
        });
      }

      const progress = await Progress.findOne({ userId: req.user._id, courseId });
      if (!progress) {
        return res.status(404).json({
          success: false,
          message: 'Progress record not found. Please enroll in this course first',
        });
      }

      if (!progress.completedLessons.includes(lessonId)) {
        progress.completedLessons.push(lessonId);
      }

      const course = await Course.findById(courseId);
      progress.progressPercent = Math.round((progress.completedLessons.length / course.totalLessons) * 100);

      if (progress.progressPercent === 100) {
        progress.status = 'completed';
        progress.completedDate = new Date();
      } else if (progress.progressPercent > 0) {
        progress.status = 'in_progress';
      }

      progress.lastAccessedDate = new Date();
      await progress.save();

      res.status(200).json({
        success: true,
        message: 'Lesson marked as completed',
        data: {
          progress: progress.progressPercent,
          status: progress.status,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LessonController();
