const Course = require('../models/course.model');
const Lesson = require('../models/lesson.model');
const Progress = require('../models/progress.model');
const Review = require('../models/review.model');

function parseTags(tags) {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  return String(tags)
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function resolveBannerFields(file, imageUrl) {
  if (file) {
    return {
      mediaUrl: `/uploads/${file.filename}`,
      mediaType: 'image',
      image: `/uploads/${file.filename}`,
    };
  }

  if (imageUrl) {
    return {
      mediaUrl: imageUrl,
      mediaType: 'image',
      image: imageUrl,
    };
  }

  return null;
}

function resolveIntroVideo(file) {
  if (!file) return null;
  return `/uploads/${file.filename}`;
}

class CourseController {
  // Create a new course
  async createCourse(req, res, next) {
    try {
      const { title, description, tags, visibility, accessType, price, image } = req.body;

      if (!title || !description) {
        return res.status(400).json({
          success: false,
          message: 'Title and description are required',
        });
      }

      const bannerFile = req.files?.banner?.[0];
      const introVideoFile = req.files?.introVideo?.[0];
      const bannerFields = resolveBannerFields(bannerFile, image);
      const introVideoUrl = resolveIntroVideo(introVideoFile);

      const course = await Course.create({
        title,
        description,
        tags: parseTags(tags),
        visibility: visibility || 'everyone',
        accessType: accessType || 'open',
        price: price ? Number(price) : 0,
        image: image || null,
        instructorId: req.user._id,
        isPublished: false,
        ...(bannerFields || {}),
        ...(introVideoUrl ? { introVideoUrl } : {}),
      });

      res.status(201).json({
        success: true,
        message: 'Course created successfully',
        data: course,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all published courses with search and filter
  async getAllCourses(req, res, next) {
    try {
      const { search, page = 1, limit = 10, accessType, visibility } = req.query;

      const filter = { isPublished: true };

      if (req.user && req.user.role === 'instructor') {
        filter.$or = [{ isPublished: true }, { instructorId: req.user._id }];
      }

      if (visibility) filter.visibility = visibility;
      if (accessType) filter.accessType = accessType;

      if (search) {
        filter.$text = { $search: search };
      }

      const skip = (page - 1) * limit;
      const courses = await Course.find(filter)
        .populate('instructorId', 'name email profileImage')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

      const total = await Course.countDocuments(filter);

      res.status(200).json({
        success: true,
        message: 'Courses fetched successfully',
        data: courses,
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

  // Get course by ID
  async getCourseById(req, res, next) {
    try {
      const { id } = req.params;

      const course = await Course.findById(id).populate('instructorId', 'name email profileImage');

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found',
        });
      }

      // Get lessons count
      const lessonsCount = await Lesson.countDocuments({ courseId: id, isPublished: true });

      // Get review stats
      const reviews = await Review.find({ courseId: id });
      const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0;

      res.status(200).json({
        success: true,
        message: 'Course fetched successfully',
        data: {
          ...course.toObject(),
          lessonsCount,
          averageRating: avgRating,
          reviewCount: reviews.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Update course
  async updateCourse(req, res, next) {
    try {
      const { id } = req.params;
      const { title, description, tags, visibility, accessType, price, image } = req.body;

      const course = await Course.findById(id);

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
          message: 'Only course instructor can update this course',
        });
      }

      if (title) course.title = title;
      if (description) course.description = description;
      if (tags !== undefined) course.tags = parseTags(tags);
      if (visibility) course.visibility = visibility;
      if (accessType) course.accessType = accessType;
      if (price !== undefined) course.price = Number(price);

      const bannerFile = req.files?.banner?.[0];
      const introVideoFile = req.files?.introVideo?.[0];

      const bannerFields = resolveBannerFields(bannerFile, image);
      if (bannerFields) {
        course.mediaUrl = bannerFields.mediaUrl;
        course.mediaType = bannerFields.mediaType;
        course.image = bannerFields.image;
      } else if (image) {
        course.image = image;
        course.mediaUrl = image;
        course.mediaType = 'image';
      }

      const introVideoUrl = resolveIntroVideo(introVideoFile);
      if (introVideoUrl) {
        course.introVideoUrl = introVideoUrl;
      }

      await course.save();

      res.status(200).json({
        success: true,
        message: 'Course updated successfully',
        data: course,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete course
  async deleteCourse(req, res, next) {
    try {
      const { id } = req.params;

      const course = await Course.findById(id);

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
          message: 'Only course instructor can delete this course',
        });
      }

      // Delete all related lessons
      await Lesson.deleteMany({ courseId: id });

      // Delete all progress records
      await Progress.deleteMany({ courseId: id });

      // Delete all reviews
      await Review.deleteMany({ courseId: id });

      // Delete course
      await Course.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: 'Course deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // Publish/Unpublish course
  async publishCourse(req, res, next) {
    try {
      const { id } = req.params;
      const { isPublished } = req.body;

      const course = await Course.findById(id);

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
          message: 'Only course instructor can publish this course',
        });
      }

      course.isPublished = isPublished;
      await course.save();

      res.status(200).json({
        success: true,
        message: `Course ${isPublished ? 'published' : 'unpublished'} successfully`,
        data: course,
      });
    } catch (error) {
      next(error);
    }
  }

  // Enroll learner in course
  async enrollCourse(req, res, next) {
    try {
      const { id } = req.params;

      const course = await Course.findById(id);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found',
        });
      }

      // Check if already enrolled
      if (course.enrolledUsers.includes(req.user._id)) {
        return res.status(400).json({
          success: false,
          message: 'Already enrolled in this course',
        });
      }

      // Check access type
      if (course.accessType === 'paid' && course.price > 0) {
        return res.status(400).json({
          success: false,
          message: 'This is a paid course. Please complete payment first.',
        });
      }

      // Add user to enrolled users
      course.enrolledUsers.push(req.user._id);
      await course.save();

      // Create progress record
      const lessonsCount = await Lesson.countDocuments({ courseId: id });
      await Progress.create({
        userId: req.user._id,
        courseId: id,
        completedLessons: [],
        progressPercent: 0,
        status: 'not_started',
      });

      res.status(200).json({
        success: true,
        message: 'Enrolled in course successfully',
        data: course,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get instructor's courses
  async getInstructorCourses(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;

      const skip = (page - 1) * limit;
      const courses = await Course.find({ instructorId: req.user._id })
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

      const total = await Course.countDocuments({ instructorId: req.user._id });

      res.status(200).json({
        success: true,
        message: 'Courses fetched successfully',
        data: courses,
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

  // Get learner's enrolled courses
  async getLearnerCourses(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;

      const skip = (page - 1) * limit;
      const courses = await Course.find({ enrolledUsers: req.user._id })
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

      const total = await Course.countDocuments({ enrolledUsers: req.user._id });

      res.status(200).json({
        success: true,
        message: 'Courses fetched successfully',
        data: courses,
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

module.exports = new CourseController();
