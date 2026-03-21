const Course = require('../models/course.model');
const Lesson = require('../models/lesson.model');
const Progress = require('../models/progress.model');

class BadgeService {
  async updateUserBadge(user) {
    user.updateBadge();
    await user.save();
    return user.badge;
  }

  calculateBadge(points) {
    if (points >= 120) return 'Master';
    if (points >= 100) return 'Expert';
    if (points >= 80) return 'Specialist';
    if (points >= 60) return 'Achiever';
    if (points >= 40) return 'Explorer';
    return 'Newbie';
  }
}

class ProgressService {
  async calculateProgressPercent(userId, courseId) {
    try {
      const course = await Course.findById(courseId);
      if (!course || course.totalLessons === 0) {
        return 0;
      }

      const progress = await Progress.findOne({ userId, courseId });
      if (!progress) {
        return 0;
      }

      const percent = (progress.completedLessons.length / course.totalLessons) * 100;
      return Math.round(percent);
    } catch (error) {
      console.error('Error calculating progress:', error);
      return 0;
    }
  }

  async updateProgressPercent(userId, courseId) {
    const percentCompleted = await this.calculateProgressPercent(userId, courseId);

    const progress = await Progress.findOne({ userId, courseId });
    if (progress) {
      progress.progressPercent = percentCompleted;

      if (percentCompleted === 100) {
        progress.status = 'completed';
        progress.completedDate = new Date();
      } else if (percentCompleted > 0) {
        progress.status = 'in_progress';
      }

      progress.lastAccessedDate = new Date();
      await progress.save();
    }

    return progress;
  }

  async getProgressByUserId(userId) {
    return await Progress.find({ userId }).populate('courseId', 'title');
  }

  async getProgressByCourseId(userId, courseId) {
    return await Progress.findOne({ userId, courseId }).populate('courseId').populate('completedLessons');
  }
}

module.exports = {
  BadgeService: new BadgeService(),
  ProgressService: new ProgressService(),
};
