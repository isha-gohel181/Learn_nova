const Review = require('../models/review.model');
const Course = require('../models/course.model');
const User = require('../models/user.model');

class ReviewController {
  // Create review
  async createReview(req, res, next) {
    try {
      const { courseId, rating, comment } = req.body;

      if (!courseId || !rating) {
        return res.status(400).json({
          success: false,
          message: 'courseId and rating are required',
        });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5',
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

      // Check if user already reviewed
      const existingReview = await Review.findOne({ userId: req.user._id, courseId });
      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: 'You have already reviewed this course',
        });
      }

      const review = await Review.create({
        userId: req.user._id,
        courseId,
        rating,
        comment: comment || '',
      });

      // Update course rating
      const reviews = await Review.find({ courseId });
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      course.averageRating = parseFloat(avgRating.toFixed(1));
      course.reviewCount = reviews.length;
      course.totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      await course.save();

      res.status(201).json({
        success: true,
        message: 'Review created successfully',
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get reviews by course
  async getReviewsByCourse(req, res, next) {
    try {
      const { courseId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const skip = (page - 1) * limit;
      const reviews = await Review.find({ courseId })
        .populate('userId', 'name profileImage badge')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

      const total = await Review.countDocuments({ courseId });

      // Get course rating info
      const course = await Course.findById(courseId);

      res.status(200).json({
        success: true,
        message: 'Reviews fetched successfully',
        data: {
          reviews,
          rating: {
            average: course.averageRating,
            total: course.totalRating,
            count: course.reviewCount,
          },
          pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Update review
  async updateReview(req, res, next) {
    try {
      const { id } = req.params;
      const { rating, comment } = req.body;

      const review = await Review.findById(id);

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found',
        });
      }

      // Check authorization
      if (review.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own review',
        });
      }

      if (rating) {
        if (rating < 1 || rating > 5) {
          return res.status(400).json({
            success: false,
            message: 'Rating must be between 1 and 5',
          });
        }
        review.rating = rating;
      }

      if (comment !== undefined) {
        review.comment = comment;
      }

      await review.save();

      // Update course rating
      const reviews = await Review.find({ courseId: review.courseId });
      const course = await Course.findById(review.courseId);
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      course.averageRating = parseFloat(avgRating.toFixed(1));
      course.totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      await course.save();

      res.status(200).json({
        success: true,
        message: 'Review updated successfully',
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete review
  async deleteReview(req, res, next) {
    try {
      const { id } = req.params;

      const review = await Review.findById(id);

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found',
        });
      }

      // Check authorization
      if (review.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own review',
        });
      }

      const courseId = review.courseId;
      await Review.findByIdAndDelete(id);

      // Update course rating
      const reviews = await Review.find({ courseId });
      const course = await Course.findById(courseId);

      if (reviews.length > 0) {
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        course.averageRating = parseFloat(avgRating.toFixed(1));
        course.totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      } else {
        course.averageRating = 0;
        course.totalRating = 0;
      }

      course.reviewCount = reviews.length;
      await course.save();

      res.status(200).json({
        success: true,
        message: 'Review deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user's reviews
  async getUserReviews(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;

      const skip = (page - 1) * limit;
      const reviews = await Review.find({ userId: req.user._id })
        .populate('courseId', 'title image')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

      const total = await Review.countDocuments({ userId: req.user._id });

      res.status(200).json({
        success: true,
        message: 'Reviews fetched successfully',
        data: reviews,
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
}

module.exports = new ReviewController();
