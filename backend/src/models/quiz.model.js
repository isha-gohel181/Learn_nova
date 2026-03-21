const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      unique: true,
    },
    questions: [
      {
        questionText: {
          type: String,
          required: true,
        },
        options: {
          type: [String],
          required: true,
          validate: {
            validator: (arr) => arr.length >= 2 && arr.length <= 6,
            message: 'Must have 2-6 options',
          },
        },
        correctAnswers: {
          type: [Number], // indices of correct options
          required: true,
          validate: {
            validator: (arr) => arr.length > 0,
            message: 'Must have at least one correct answer',
          },
        },
        explanation: {
          type: String,
          default: '',
        },
        points: {
          type: Number,
          default: 1,
          min: 1,
        },
      },
    ],
    rewards: {
      first: {
        type: Number,
        default: 10,
      },
      second: {
        type: Number,
        default: 8,
      },
      third: {
        type: Number,
        default: 5,
      },
      fourth: {
        type: Number,
        default: 2,
      },
    },
    passingScore: {
      type: Number,
      default: 60,
      min: 0,
      max: 100,
    },
    totalQ: {
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

module.exports = mongoose.model('Quiz', quizSchema);
