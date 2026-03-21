const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a lesson title'],
      trim: true,
      minlength: 3,
      maxlength: 200,
    },
    type: {
      type: String,
      enum: ['video', 'document', 'image', 'quiz'],
      required: true,
    },
    contentUrl: {
      type: String,
      required: [true, 'Please provide a content URL'],
    },
    duration: {
      type: Number, // in minutes
      default: 0,
      min: 0,
    },
    attachments: [
      {
        title: String,
        url: String,
      },
    ],
    description: {
      type: String,
      maxlength: 1000,
    },
    order: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Lesson', lessonSchema);
