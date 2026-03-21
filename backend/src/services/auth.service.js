const User = require('../models/user.model');
const { generateToken } = require('../utils/jwt.util');
const { validateEmail, validatePassword } = require('../utils/validation.util');

class AuthService {
  async register(data) {
    const { name, email, password, confirmPassword, role } = data;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      throw new Error('All fields are required');
    }

    if (!validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    if (!validatePassword(password)) {
      throw new Error('Password must be at least 6 characters');
    }

    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new Error('Email already registered');
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
      throw new Error('Email and password are required');
    }

    if (!validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    // Find user and include password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      throw new Error('Invalid email or password');
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
      throw new Error('User not found');
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
