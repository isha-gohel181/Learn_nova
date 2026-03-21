const User = require('../models/user.model');
const { generateToken } = require('../utils/jwt.util');
const { validateEmail, validatePassword } = require('../utils/validation.util');
const AppError = require('../utils/error.util');

class AuthService {
  async register(data) {
    const { name, email, password, confirmPassword, role } = data;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      throw new AppError('All fields are required', 400);
    }

    if (!validateEmail(email)) {
      throw new AppError('Invalid email format', 400);
    }

    if (!validatePassword(password)) {
      throw new AppError('Password must be at least 6 characters', 400);
    }

    if (password !== confirmPassword) {
      throw new AppError('Passwords do not match', 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    // Create new user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'learner',
    });

    const token = generateToken(user._id);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        badge: user.badge,
        points: user.points,
      },
      token,
    };
  }

  async login(email, password) {
    // Validation
    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    if (!validateEmail(email)) {
      throw new AppError('Invalid email format', 400);
    }

    // Find user and include password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = generateToken(user._id);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        badge: user.badge,
        points: user.points,
      },
      token,
    };
  }

  async getUserProfile(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      badge: user.badge,
      points: user.points,
      profileImage: user.profileImage,
      bio: user.bio,
      createdAt: user.createdAt,
    };
  }
}

module.exports = new AuthService();
