/**
 * Request validation helper for input validation
 */

const validateCreateCourse = (data) => {
  const errors = [];

  if (!data.title || data.title.trim().length < 5) {
    errors.push('Course title must be at least 5 characters');
  }

  if (!data.description || data.description.trim().length < 10) {
    errors.push('Course description must be at least 10 characters');
  }

  if (data.price && data.price < 0) {
    errors.push('Course price cannot be negative');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateCreateLesson = (data) => {
  const errors = [];
  const validTypes = ['video', 'document', 'image', 'quiz'];

  if (!data.courseId) {
    errors.push('Course ID is required');
  }

  if (!data.title || data.title.trim().length < 3) {
    errors.push('Lesson title must be at least 3 characters');
  }

  if (!data.type || !validTypes.includes(data.type)) {
    errors.push(`Lesson type must be one of: ${validTypes.join(', ')}`);
  }

  if (!data.contentUrl) {
    errors.push('Content URL is required');
  }

  if (data.duration && data.duration < 0) {
    errors.push('Lesson duration cannot be negative');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateCreateQuiz = (data) => {
  const errors = [];

  if (!data.courseId) {
    errors.push('Course ID is required');
  }

  if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
    errors.push('At least one question is required');
  }

  if (data.questions) {
    data.questions.forEach((q, index) => {
      if (!q.questionText) {
        errors.push(`Question ${index + 1}: Question text is required`);
      }

      if (!q.options || !Array.isArray(q.options) || q.options.length < 2) {
        errors.push(`Question ${index + 1}: At least 2 options are required`);
      }

      if (!q.correctAnswers || !Array.isArray(q.correctAnswers) || q.correctAnswers.length === 0) {
        errors.push(`Question ${index + 1}: At least one correct answer is required`);
      }
    });
  }

  if (data.passingScore && (data.passingScore < 0 || data.passingScore > 100)) {
    errors.push('Passing score must be between 0 and 100');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateCreateReview = (data) => {
  const errors = [];

  if (!data.courseId) {
    errors.push('Course ID is required');
  }

  if (!data.rating || data.rating < 1 || data.rating > 5) {
    errors.push('Rating must be between 1 and 5');
  }

  if (data.comment && data.comment.length > 1000) {
    errors.push('Comment must not exceed 1000 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateRegister = (data) => {
  const errors = [];
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }

  if (!data.email || !emailRegex.test(data.email)) {
    errors.push('Valid email is required');
  }

  if (!data.password || data.password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (data.password !== data.confirmPassword) {
    errors.push('Passwords do not match');
  }

  if (data.role && !['instructor', 'learner'].includes(data.role)) {
    errors.push('Role must be either instructor or learner');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateLogin = (data) => {
  const errors = [];
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

  if (!data.email || !emailRegex.test(data.email)) {
    errors.push('Valid email is required');
  }

  if (!data.password) {
    errors.push('Password is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateCreateCourse,
  validateCreateLesson,
  validateCreateQuiz,
  validateCreateReview,
  validateRegister,
  validateLogin,
};
