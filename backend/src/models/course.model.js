const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a course title'],
      trim: true,
      minlength: 5,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      minlength: 10,
      maxlength: 3000,
    },
    tags: {
      type: [String],
      default: [],
    },
    image: {
      type: String,
      default: null,
    },
    mediaUrl: {
      type: String,
      default: null,
    },
    mediaType: {
      type: String,
      enum: ['image', 'video'],
      default: 'image',
    },
    introVideoUrl: {
      type: String,
      default: null,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    visibility: {
      type: String,
      enum: ['everyone', 'signed'],
      default: 'everyone',
    },
    accessType: {
      type: String,
      enum: ['open', 'invite', 'paid'],
      default: 'open',
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    enrolledUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    totalLessons: {
      type: Number,
      default: 0,
    },
    totalRating: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for full-text search
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Course', courseSchema);
