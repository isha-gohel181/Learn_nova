const Quiz = require('../models/quiz.model');
const Course = require('../models/course.model');
const Progress = require('../models/progress.model');
const User = require('../models/user.model');
const { BadgeService } = require('../services/progress.service');

class QuizController {
  // Create quiz for a course
  async createQuiz(req, res, next) {
    try {
      const { courseId, questions, rewards, passingScore } = req.body;

      if (!courseId || !questions || questions.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'courseId and questions are required',
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

      // Check if user is instructor
      if (course.instructorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Only course instructor can create quiz',
        });
      }

      // Check if quiz already exists for this course
      const existingQuiz = await Quiz.findOne({ courseId });
      if (existingQuiz) {
        return res.status(400).json({
          success: false,
          message: 'Quiz already exists for this course',
        });
      }

      const quiz = await Quiz.create({
        courseId,
        questions,
        rewards: rewards || { first: 10, second: 8, third: 5, fourth: 2 },
        passingScore: passingScore || 60,
        totalQ: questions.length,
        isPublished: false,
      });

      res.status(201).json({
        success: true,
        message: 'Quiz created successfully',
        data: quiz,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get quiz by course ID
  async getQuizByCourse(req, res, next) {
    try {
      const { courseId } = req.params;

      const quiz = await Quiz.findOne({ courseId, isPublished: true });

      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found for this course',
        });
      }

      // Hide correct answers from learners
      const quizData = quiz.toObject();
      if (req.user.role === 'learner') {
        quizData.questions = quizData.questions.map((q) => {
          const { correctAnswers, explanation, ...rest } = q;
          return rest;
        });
      }

      res.status(200).json({
        success: true,
        message: 'Quiz fetched successfully',
        data: quizData,
      });
    } catch (error) {
      next(error);
    }
  }

  // Submit quiz answers
  async submitQuiz(req, res, next) {
    try {
      const { courseId, answers } = req.body;

      if (!courseId || !answers) {
        return res.status(400).json({
          success: false,
          message: 'courseId and answers are required',
        });
      }

      // Get quiz
      const quiz = await Quiz.findOne({ courseId });
      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found',
        });
      }

      // Calculate score
      let score = 0;
      let correctCount = 0;

      quiz.questions.forEach((question, index) => {
        const userAnswer = answers[index];
        if (Array.isArray(userAnswer) && Array.isArray(question.correctAnswers)) {
          const isCorrect = JSON.stringify(userAnswer.sort((a, b) => a - b)) === JSON.stringify(question.correctAnswers.sort((a, b) => a - b));
          if (isCorrect) {
            score += question.points || 1;
            correctCount++;
          }
        }
      });

      const percentage = Math.round((score / quiz.questions.length) * 100);
      const isPassed = percentage >= quiz.passingScore;

      // Get or create progress record
      let progress = await Progress.findOne({ userId: req.user._id, courseId });
      if (!progress) {
        progress = await Progress.create({
          userId: req.user._id,
          courseId,
          completedLessons: [],
          status: 'not_started',
        });
      }

      // Add attempt
      const attemptNumber = (progress.totalAttempts || 0) + 1;
      let pointsEarned = 0;

      if (isPassed) {
        if (attemptNumber === 1) pointsEarned = quiz.rewards.first;
        else if (attemptNumber === 2) pointsEarned = quiz.rewards.second;
        else if (attemptNumber === 3) pointsEarned = quiz.rewards.third;
        else pointsEarned = quiz.rewards.fourth;

        // Add points to user
        const user = await User.findByIdAndUpdate(req.user._id, { $inc: { points: pointsEarned } }, { new: true });

        // Update badge if necessary
        await BadgeService.updateUserBadge(user);
      }

      progress.quizAttempts.push({
        attemptNumber,
        score: correctCount,
        percentage,
        answers,
        pointsEarned,
      });

      progress.totalAttempts = attemptNumber;
      if (percentage > progress.highestScore) {
        progress.highestScore = percentage;
      }

      await progress.save();

      res.status(200).json({
        success: true,
        message: `Quiz submitted. Score: ${percentage}%`,
        data: {
          attemptNumber,
          score: correctCount,
          totalQuestions: quiz.questions.length,
          percentage,
          isPassed,
          pointsEarned,
          highestScore: progress.highestScore,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Get quiz results
  async getQuizResults(req, res, next) {
    try {
      const { courseId } = req.params;

      const progress = await Progress.findOne({
        userId: req.user._id,
        courseId,
      });

      if (!progress || !progress.quizAttempts || progress.quizAttempts.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No quiz attempts found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Quiz results fetched successfully',
        data: {
          attempts: progress.quizAttempts,
          highestScore: progress.highestScore,
          totalAttempts: progress.totalAttempts,
          lastAttempt: progress.quizAttempts[progress.quizAttempts.length - 1],
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Update quiz
  async updateQuiz(req, res, next) {
    try {
      const { courseId } = req.params;
      const { questions, rewards, passingScore } = req.body;

      const quiz = await Quiz.findOne({ courseId });

      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found',
        });
      }

      // Check authorization
      const course = await Course.findById(courseId);
      if (course.instructorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Only course instructor can update quiz',
        });
      }

      if (questions) {
        quiz.questions = questions;
        quiz.totalQ = questions.length;
      }
      if (rewards) quiz.rewards = rewards;
      if (passingScore) quiz.passingScore = passingScore;

      await quiz.save();

      res.status(200).json({
        success: true,
        message: 'Quiz updated successfully',
        data: quiz,
      });
    } catch (error) {
      next(error);
    }
  }

  // Publish quiz
  async publishQuiz(req, res, next) {
    try {
      const { courseId } = req.params;
      const { isPublished } = req.body;

      const quiz = await Quiz.findOne({ courseId });

      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found',
        });
      }

      // Check authorization
      const course = await Course.findById(courseId);
      if (course.instructorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Only course instructor can publish quiz',
        });
      }

      quiz.isPublished = isPublished;
      await quiz.save();

      res.status(200).json({
        success: true,
        message: `Quiz ${isPublished ? 'published' : 'unpublished'} successfully`,
        data: quiz,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new QuizController();
