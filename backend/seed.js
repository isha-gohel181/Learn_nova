const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcryptjs = require('bcryptjs');
const User = require('./src/models/user.model');
const Course = require('./src/models/course.model');
const Lesson = require('./src/models/lesson.model');
const Quiz = require('./src/models/quiz.model');
const Progress = require('./src/models/progress.model');
const Review = require('./src/models/review.model');

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/learnova');
    console.log('MongoDB connected for seeding');

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Lesson.deleteMany({});
    await Quiz.deleteMany({});
    await Progress.deleteMany({});
    await Review.deleteMany({});

    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
    const hashPassword = async (password) => bcryptjs.hash(password, saltRounds);

    const instructorSeed = [
      {
        name: 'John Instructor',
        email: 'john@instructor.com',
        password: 'password123',
        role: 'instructor',
        points: 150,
        badge: 'Master',
      },
      {
        name: 'Sarah Teacher',
        email: 'sarah@instructor.com',
        password: 'password123',
        role: 'instructor',
        points: 120,
        badge: 'Master',
      },
    ];

    const learnerSeed = [
      {
        name: 'Alice Learner',
        email: 'alice@learner.com',
        password: 'password123',
        role: 'learner',
        points: 80,
        badge: 'Specialist',
      },
      {
        name: 'Bob Student',
        email: 'bob@learner.com',
        password: 'password123',
        role: 'learner',
        points: 45,
        badge: 'Explorer',
      },
      {
        name: 'Charlie Beginner',
        email: 'charlie@learner.com',
        password: 'password123',
        role: 'learner',
        points: 15,
        badge: 'Newbie',
      },
      {
        name: 'Dhatri Patel',
        email: 'dhatripatel67@gmail.com',
        password: '123456A@a',
        role: 'learner',
        points: 55,
        badge: 'Achiever',
      },
      {
        name: 'Dhatri Patel (Alt)',
        email: 'dhatripatel2336@gmail.com',
        password: '123456A@a',
        role: 'learner',
        points: 25,
        badge: 'Explorer',
      },
      {
        name: 'Isha Gupta',
        email: 'isha.learner1@example.com',
        password: 'password123',
        role: 'learner',
        points: 35,
        badge: 'Explorer',
      },
      {
        name: 'Parth Mehta',
        email: 'parth.learner2@example.com',
        password: 'password123',
        role: 'learner',
        points: 90,
        badge: 'Expert',
      },
    ];

    const instructors = await User.insertMany(
      await Promise.all(
        instructorSeed.map(async (user) => ({
          ...user,
          password: await hashPassword(user.password),
        }))
      )
    );

    const learners = await User.insertMany(
      await Promise.all(
        learnerSeed.map(async (user) => ({
          ...user,
          password: await hashPassword(user.password),
        }))
      )
    );

    // Create sample courses
    const courses = await Course.insertMany([
      {
        title: 'Web Development Fundamentals',
        description: 'Learn the basics of web development including HTML, CSS, and JavaScript',
        tags: ['web', 'development', 'javascript', 'html', 'css'],
        image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&q=80',
        isPublished: true,
        visibility: 'everyone',
        accessType: 'open',
        price: 0,
        instructorId: instructors[0]._id,
        enrolledUsers: [learners[0]._id, learners[1]._id, learners[3]._id],
        totalLessons: 3,
        totalRating: 18,
        averageRating: 4.5,
        reviewCount: 4,
      },
      {
        title: 'Advanced JavaScript Concepts',
        description: 'Master advanced JavaScript concepts like closures, prototypes, and async programming',
        tags: ['javascript', 'advanced', 'programming'],
        image: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?auto=format&fit=crop&q=80',
        isPublished: true,
        visibility: 'everyone',
        accessType: 'open',
        price: 0,
        instructorId: instructors[0]._id,
        enrolledUsers: [learners[0]._id, learners[3]._id],
        totalLessons: 4,
        totalRating: 14,
        averageRating: 4.67,
        reviewCount: 3,
      },
      {
        title: 'React.js Complete Guide',
        description: 'Build modern web applications with React.js',
        tags: ['react', 'javascript', 'frontend'],
        image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80',
        isPublished: true,
        visibility: 'everyone',
        accessType: 'open',
        price: 0,
        instructorId: instructors[1]._id,
        enrolledUsers: [learners[1]._id, learners[2]._id, learners[4]._id],
        totalLessons: 5,
        totalRating: 25,
        averageRating: 4.2,
        reviewCount: 6,
      },
      {
        title: 'Node.js Backend Development',
        description: 'Create scalable backend applications with Node.js and Express',
        tags: ['nodejs', 'backend', 'express', 'javascript'],
        image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop&q=80',
        isPublished: false,
        visibility: 'everyone',
        accessType: 'open',
        price: 0,
        instructorId: instructors[1]._id,
        enrolledUsers: [],
        totalLessons: 0,
      },
      {
        title: 'Python for Data Science',
        description: 'Learn Python programming from scratch focusing on Data Science applications',
        tags: ['python', 'data science', 'programming'],
        image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&q=80',
        isPublished: true,
        visibility: 'everyone',
        accessType: 'open',
        price: 0,
        instructorId: instructors[0]._id,
        enrolledUsers: [learners[2]._id, learners[3]._id],
        totalLessons: 8,
        totalRating: 50,
        averageRating: 4.8,
        reviewCount: 10,
      },
      {
        title: 'UI/UX Design Principles',
        description: 'Design beautiful, usable interfaces learning Figma and design theory',
        tags: ['design', 'ui', 'ux', 'figma'],
        image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80',
        isPublished: true,
        visibility: 'everyone',
        accessType: 'paid',
        price: 29.99,
        instructorId: instructors[1]._id,
        enrolledUsers: [learners[0]._id, learners[4]._id],
        totalLessons: 6,
        totalRating: 30,
        averageRating: 4.4,
        reviewCount: 7,
      },
      {
        title: 'Mastering TypeScript',
        description: 'Level up your JavaScript code by learning TypeScript fundamentals and advanced types',
        tags: ['typescript', 'javascript', 'frontend'],
        image: 'https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&q=80',
        isPublished: true,
        visibility: 'everyone',
        accessType: 'open',
        price: 0,
        instructorId: instructors[0]._id,
        enrolledUsers: [learners[1]._id, learners[3]._id],
        totalLessons: 4,
        totalRating: 20,
        averageRating: 4.7,
        reviewCount: 5,
      },
      {
        title: 'Docker & Kubernetes Basics',
        description: 'Introduction to containerization and orchestration for modern DevOps',
        tags: ['devops', 'docker', 'kubernetes', 'backend'],
        image: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?auto=format&fit=crop&q=80',
        isPublished: true,
        visibility: 'everyone',
        accessType: 'paid',
        price: 49.99,
        instructorId: instructors[1]._id,
        enrolledUsers: [],
        totalLessons: 10,
        totalRating: 0,
        averageRating: 0,
        reviewCount: 0,
      },
      {
        title: 'Machine Learning A-Z',
        description: 'Complete guide to Machine Learning algorithms and implementations',
        tags: ['machine learning', 'ai', 'python'],
        image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&q=80',
        isPublished: true,
        visibility: 'everyone',
        accessType: 'paid',
        price: 89.99,
        instructorId: instructors[0]._id,
        enrolledUsers: [learners[0]._id, learners[2]._id, learners[3]._id],
        totalLessons: 15,
        totalRating: 120,
        averageRating: 4.9,
        reviewCount: 25,
      },
      {
        title: 'Fullstack Next.js 14',
        description: 'Build production-ready fullstack applications using the latest Next.js 14 features',
        tags: ['nextjs', 'react', 'fullstack'],
        image: 'https://images.unsplash.com/photo-1618477247222-ac60c628164e?auto=format&fit=crop&q=80',
        isPublished: true,
        visibility: 'everyone',
        accessType: 'open',
        price: 0,
        instructorId: instructors[1]._id,
        enrolledUsers: [learners[1]._id, learners[0]._id, learners[2]._id, learners[4]._id],
        totalLessons: 12,
        totalRating: 85,
        averageRating: 4.6,
        reviewCount: 18,
      },
      {
        title: 'Cybersecurity 101',
        description: 'Learn the fundamentals of hacking, securing networks, and identifying vulnerabilities',
        tags: ['security', 'cybersecurity', 'networks'],
        image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80',
        isPublished: true,
        visibility: 'everyone',
        accessType: 'open',
        price: 0,
        instructorId: instructors[0]._id,
        enrolledUsers: [learners[2]._id, learners[4]._id],
        totalLessons: 5,
        totalRating: 15,
        averageRating: 4.1,
        reviewCount: 4,
      },
      {
        title: 'Introduction to GraphQL',
        description: 'Move away from REST and learn how to query APIs with GraphQL and Apollo',
        tags: ['graphql', 'api', 'backend'],
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80',
        isPublished: false,
        visibility: 'everyone',
        accessType: 'open',
        price: 0,
        instructorId: instructors[1]._id,
        enrolledUsers: [],
        totalLessons: 0,
        totalRating: 0,
        averageRating: 0,
        reviewCount: 0,
      },
      {
        title: 'Mobile App Dev with React Native',
        description: 'Build native iOS and Android applications using React Native and Expo',
        tags: ['mobile', 'react native', 'javascript'],
        image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80',
        isPublished: true,
        visibility: 'everyone',
        accessType: 'paid',
        price: 39.99,
        instructorId: instructors[0]._id,
        enrolledUsers: [learners[1]._id, learners[4]._id],
        totalLessons: 9,
        totalRating: 40,
        averageRating: 4.5,
        reviewCount: 9,
      },
      {
        title: 'AWS Cloud Practitioner',
        description: 'Prepare for the AWS Cloud Practitioner certification with hands-on labs',
        tags: ['aws', 'cloud', 'certification'],
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80',
        isPublished: true,
        visibility: 'everyone',
        accessType: 'open',
        price: 0,
        instructorId: instructors[1]._id,
        enrolledUsers: [learners[0]._id, learners[2]._id, learners[3]._id, learners[5]._id],
        totalLessons: 14,
        totalRating: 65,
        averageRating: 4.8,
        reviewCount: 15,
      },
      {
        title: 'Go Programming Language',
        description: 'Write fast, reliable, and efficient software at scale with Golang',
        tags: ['go', 'golang', 'backend'],
        image: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&q=80',
        isPublished: true,
        visibility: 'everyone',
        accessType: 'paid',
        price: 19.99,
        instructorId: instructors[0]._id,
        enrolledUsers: [learners[1]._id, learners[4]._id],
        totalLessons: 7,
        totalRating: 22,
        averageRating: 4.6,
        reviewCount: 5,
      }
    ]);

    // Create sample lessons for first course
    const lessons = await Lesson.insertMany([
      {
        courseId: courses[0]._id,
        title: 'HTML Basics',
        type: 'video',
        contentUrl: 'https://example.com/html-basics.mp4',
        duration: 30,
        description: 'Introduction to HTML structure and tags',
        order: 1,
        isPublished: true,
        attachments: [{ title: 'HTML Cheat Sheet', url: 'https://example.com/html-cheatsheet.pdf' }],
      },
      {
        courseId: courses[0]._id,
        title: 'CSS Styling',
        type: 'video',
        contentUrl: 'https://example.com/css-basics.mp4',
        duration: 45,
        description: 'Learn CSS for styling web pages',
        order: 2,
        isPublished: true,
        attachments: [{ title: 'CSS Properties Guide', url: 'https://example.com/css-guide.pdf' }],
      },
      {
        courseId: courses[0]._id,
        title: 'JavaScript Fundamentals',
        type: 'document',
        contentUrl: 'https://example.com/js-doc.pdf',
        duration: 60,
        description: 'Get started with JavaScript programming',
        order: 3,
        isPublished: true,
      },
      {
        courseId: courses[1]._id,
        title: 'Closures Explained',
        type: 'video',
        contentUrl: 'https://example.com/closures.mp4',
        duration: 50,
        description: 'Understanding JavaScript closures',
        order: 1,
        isPublished: true,
      },
    ]);

    // Create quizzes for all courses
    const quizzes = await Quiz.insertMany(
      courses.map((course, index) => {
        const difficulty = index % 3;
        const baseQuestions = [
          {
            questionText: 'What is the main goal of this course?',
            options: ['Understand core concepts', 'Learn only advanced topics', 'Focus on tooling only', 'Skip fundamentals'],
            correctAnswers: [0],
            explanation: 'Each course starts with core concepts before advanced topics.',
            points: 1,
          },
          {
            questionText: 'Which statement best describes best practices?',
            options: ['Ignore documentation', 'Use consistent patterns', 'Avoid testing', 'Skip code reviews'],
            correctAnswers: [1],
            explanation: 'Consistent patterns and documentation are considered best practice.',
            points: 1,
          },
          {
            questionText: 'When should you apply what you learn?',
            options: ['Only at the end', 'During practice exercises', 'Never', 'Only in theory'],
            correctAnswers: [1],
            explanation: 'Practice reinforces understanding throughout the course.',
            points: 1,
          },
        ];

        const advancedQuestion =
          difficulty === 2
            ? {
                questionText: 'What is a common pitfall to avoid in projects?',
                options: ['Ignoring edge cases', 'Writing documentation', 'Refactoring', 'Testing'],
                correctAnswers: [0],
                explanation: 'Edge cases are easy to miss and can cause failures.',
                points: 2,
              }
            : null;

        const questions = advancedQuestion ? [...baseQuestions, advancedQuestion] : baseQuestions;

        return {
          courseId: course._id,
          questions,
          rewards: { first: 10, second: 8, third: 5, fourth: 2 },
          passingScore: advancedQuestion ? 70 : 60,
          totalQ: questions.length,
          isPublished: true,
        };
      })
    );

    const lessonsByCourseId = lessons.reduce((acc, lesson) => {
      const key = lesson.courseId.toString();
      if (!acc[key]) acc[key] = [];
      acc[key].push(lesson._id);
      return acc;
    }, {});

    const progressEntries = [
      {
        userId: learners[0]._id,
        courseId: courses[0]._id,
        completedLessons: (lessonsByCourseId[courses[0]._id.toString()] || []).slice(0, 2),
        progressPercent: 65,
        status: 'in_progress',
        totalAttempts: 1,
        highestScore: 80,
        quizAttempts: [
          { attemptNumber: 1, score: 8, percentage: 80, answers: [], pointsEarned: 8 },
        ],
      },
      {
        userId: learners[0]._id,
        courseId: courses[2]._id,
        completedLessons: [],
        progressPercent: 20,
        status: 'in_progress',
      },
      {
        userId: learners[0]._id,
        courseId: courses[8]._id,
        completedLessons: [],
        progressPercent: 100,
        status: 'completed',
        completedDate: new Date(),
        totalAttempts: 2,
        highestScore: 90,
        quizAttempts: [
          { attemptNumber: 1, score: 7, percentage: 70, answers: [], pointsEarned: 7 },
          { attemptNumber: 2, score: 9, percentage: 90, answers: [], pointsEarned: 9 },
        ],
      },
      {
        userId: learners[1]._id,
        courseId: courses[1]._id,
        completedLessons: (lessonsByCourseId[courses[1]._id.toString()] || []).slice(0, 1),
        progressPercent: 35,
        status: 'in_progress',
      },
      {
        userId: learners[1]._id,
        courseId: courses[3]._id,
        completedLessons: [],
        progressPercent: 0,
        status: 'not_started',
      },
      {
        userId: learners[1]._id,
        courseId: courses[5]._id,
        completedLessons: [],
        progressPercent: 60,
        status: 'in_progress',
      },
      {
        userId: learners[1]._id,
        courseId: courses[9]._id,
        completedLessons: [],
        progressPercent: 100,
        status: 'completed',
        completedDate: new Date(),
      },
      {
        userId: learners[2]._id,
        courseId: courses[2]._id,
        completedLessons: [],
        progressPercent: 45,
        status: 'in_progress',
      },
      {
        userId: learners[2]._id,
        courseId: courses[4]._id,
        completedLessons: [],
        progressPercent: 100,
        status: 'completed',
        completedDate: new Date(),
      },
      {
        userId: learners[2]._id,
        courseId: courses[10]._id,
        completedLessons: [],
        progressPercent: 25,
        status: 'in_progress',
      },
      {
        userId: learners[3]._id,
        courseId: courses[0]._id,
        completedLessons: (lessonsByCourseId[courses[0]._id.toString()] || []).slice(0, 1),
        progressPercent: 40,
        status: 'in_progress',
      },
      {
        userId: learners[3]._id,
        courseId: courses[4]._id,
        completedLessons: [],
        progressPercent: 70,
        status: 'in_progress',
      },
      {
        userId: learners[3]._id,
        courseId: courses[8]._id,
        completedLessons: [],
        progressPercent: 100,
        status: 'completed',
        completedDate: new Date(),
      },
      {
        userId: learners[4]._id,
        courseId: courses[2]._id,
        completedLessons: [],
        progressPercent: 30,
        status: 'in_progress',
      },
      {
        userId: learners[4]._id,
        courseId: courses[5]._id,
        completedLessons: [],
        progressPercent: 55,
        status: 'in_progress',
      },
      {
        userId: learners[4]._id,
        courseId: courses[9]._id,
        completedLessons: [],
        progressPercent: 100,
        status: 'completed',
        completedDate: new Date(),
      },
      {
        userId: learners[4]._id,
        courseId: courses[13]._id,
        completedLessons: [],
        progressPercent: 50,
        status: 'in_progress',
      },
      {
        userId: learners[5]._id,
        courseId: courses[12]._id,
        completedLessons: [],
        progressPercent: 100,
        status: 'completed',
        completedDate: new Date(),
      },
      {
        userId: learners[5]._id,
        courseId: courses[7]._id,
        completedLessons: [],
        progressPercent: 40,
        status: 'in_progress',
      },
    ];

    const progressData = await Progress.insertMany(progressEntries);

    const reviewEntries = [
      { userId: learners[0]._id, courseId: courses[0]._id, rating: 5, comment: 'Great starter course with clear lessons.' },
      { userId: learners[1]._id, courseId: courses[0]._id, rating: 4, comment: 'Helpful refresher, pacing was good.' },
      { userId: learners[2]._id, courseId: courses[2]._id, rating: 4, comment: 'Solid React coverage.' },
      { userId: learners[0]._id, courseId: courses[1]._id, rating: 5, comment: 'Loved the deep dive into JS concepts.' },
      { userId: learners[1]._id, courseId: courses[5]._id, rating: 4, comment: 'Great UI/UX tips.' },
      { userId: learners[2]._id, courseId: courses[4]._id, rating: 5, comment: 'Python explanations were clear.' },
      { userId: learners[0]._id, courseId: courses[8]._id, rating: 5, comment: 'Machine learning content was excellent.' },
      { userId: learners[1]._id, courseId: courses[6]._id, rating: 4, comment: 'TypeScript examples were helpful.' },
      { userId: learners[2]._id, courseId: courses[9]._id, rating: 4, comment: 'Next.js overview was practical.' },
      { userId: learners[0]._id, courseId: courses[12]._id, rating: 5, comment: 'AWS prep was solid.' },
      { userId: learners[3]._id, courseId: courses[0]._id, rating: 4, comment: 'Nice foundational coverage.' },
      { userId: learners[3]._id, courseId: courses[4]._id, rating: 5, comment: 'Great Python walkthroughs.' },
      { userId: learners[4]._id, courseId: courses[2]._id, rating: 4, comment: 'React modules were practical.' },
      { userId: learners[4]._id, courseId: courses[5]._id, rating: 4, comment: 'Design tips are useful.' },
      { userId: learners[4]._id, courseId: courses[13]._id, rating: 5, comment: 'Golang course was concise and clear.' },
      { userId: learners[5]._id, courseId: courses[12]._id, rating: 5, comment: 'Great cloud fundamentals.' },
      { userId: learners[5]._id, courseId: courses[7]._id, rating: 4, comment: 'DevOps overview was helpful.' },
    ];

    const reviews = await Review.insertMany(reviewEntries);

    console.log('✅ Database seeded successfully!');
    console.log(`
    Sample Data Created:
    - ${instructors.length} Instructors
    - ${learners.length} Learners
    - ${courses.length} Courses
    - ${lessons.length} Lessons
    - ${quizzes.length} Quizzes
    - ${progressData.length} Progress entries
    - ${reviews.length} Reviews

    Sample Login Credentials:
    Instructor: john@instructor.com / password123
    Learner: alice@learner.com / password123
    `);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();