const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['instructor', 'learner'],
      default: 'learner',
      required: true,
    },
    points: {
      type: Number,
      default: 0,
      min: 0,
    },
    badge: {
      type: String,
      enum: ['Newbie', 'Explorer', 'Achiever', 'Specialist', 'Expert', 'Master'],
      default: 'Newbie',
    },
    profileImage: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcryptjs.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 10);
  this.password = await bcryptjs.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

// Method to update badge based on points
userSchema.methods.updateBadge = function () {
  if (this.points >= 120) this.badge = 'Master';
  else if (this.points >= 100) this.badge = 'Expert';
  else if (this.points >= 80) this.badge = 'Specialist';
  else if (this.points >= 60) this.badge = 'Achiever';
  else if (this.points >= 40) this.badge = 'Explorer';
  else this.badge = 'Newbie';
};

module.exports = mongoose.model('User', userSchema);
