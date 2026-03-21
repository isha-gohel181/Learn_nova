const validateEmail = (email) => {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

const validateRating = (rating) => {
  return rating >= 1 && rating <= 5;
};

const validateRole = (role) => {
  return ['instructor', 'learner'].includes(role);
};

const validateCourseVisibility = (visibility) => {
  return ['everyone', 'signed'].includes(visibility);
};

const validateAccessType = (accessType) => {
  return ['open', 'invite', 'paid'].includes(accessType);
};

const validateLessonType = (type) => {
  return ['video', 'document', 'image', 'quiz'].includes(type);
};

module.exports = {
  validateEmail,
  validatePassword,
  validateUrl,
  validateRating,
  validateRole,
  validateCourseVisibility,
  validateAccessType,
  validateLessonType,
};
