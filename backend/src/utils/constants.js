// Application constants
const ROLES = {
  INSTRUCTOR: 'instructor',
  LEARNER: 'learner',
};

const BADGE_LEVELS = {
  NEWBIE: 'Newbie',
  EXPLORER: 'Explorer',
  ACHIEVER: 'Achiever',
  SPECIALIST: 'Specialist',
  EXPERT: 'Expert',
  MASTER: 'Master',
};

const BADGE_POINTS = {
  NEWBIE: 0,
  EXPLORER: 40,
  ACHIEVER: 60,
  SPECIALIST: 80,
  EXPERT: 100,
  MASTER: 120,
};

const LESSON_TYPES = {
  VIDEO: 'video',
  DOCUMENT: 'document',
  IMAGE: 'image',
  QUIZ: 'quiz',
};

const COURSE_VISIBILITY = {
  EVERYONE: 'everyone',
  SIGNED: 'signed',
};

const COURSE_ACCESS_TYPE = {
  OPEN: 'open',
  INVITE: 'invite',
  PAID: 'paid',
};

const PROGRESS_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
};

const QUIZ_REWARDS = {
  FIRST_ATTEMPT: 10,
  SECOND_ATTEMPT: 8,
  THIRD_ATTEMPT: 5,
  FOURTH_PLUS_ATTEMPT: 2,
};

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Please login first',
  FORBIDDEN: 'Access denied',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation failed',
  SERVER_ERROR: 'Internal server error',
};

module.exports = {
  ROLES,
  BADGE_LEVELS,
  BADGE_POINTS,
  LESSON_TYPES,
  COURSE_VISIBILITY,
  COURSE_ACCESS_TYPE,
  PROGRESS_STATUS,
  QUIZ_REWARDS,
  HTTP_STATUS,
  ERROR_MESSAGES,
};
