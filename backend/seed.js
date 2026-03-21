const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/user.model');
const Course = require('./models/course.model');
const Lesson = require('./models/lesson.model');
const Quiz = require('./models/quiz.model');

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

    // Create sample instructors
    const instructors = await User.insertMany([
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
    ]);

    // Create sample learners
    const learners = await User.insertMany([
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
    ]);

    // Create sample courses
    const courses = await Course.insertMany([
      {
        title: 'Web Development Fundamentals',
        description: 'Learn the basics of web development including HTML, CSS, and JavaScript',
        tags: ['web', 'development', 'javascript', 'html', 'css'],
        image: 'https://via.placeholder.com/400x300?text=Web+Development',
        isPublished: true,
        visibility: 'everyone',
        accessType: 'open',
        price: 0,
        instructorId: instructors[0]._id,
        enrolledUsers: [learners[0]._id, learners[1]._id],
        totalLessons: 3,
        totalRating: 18,
        averageRating: 4.5,
        reviewCount: 4,
      },
      {
        title: 'Advanced JavaScript Concepts',
        description: 'Master advanced JavaScript concepts like closures, prototypes, and async programming',
        tags: ['javascript', 'advanced', 'programming'],
        image: 'https://via.placeholder.com/400x300?text=Advanced+JS',
        isPublished: true,
        visibility: 'everyone',
        accessType: 'open',
        price: 0,
        instructorId: instructors[0]._id,
        enrolledUsers: [learners[0]._id],
        totalLessons: 4,
        totalRating: 14,
        averageRating: 4.67,
        reviewCount: 3,
      },
      {
        title: 'React.js Complete Guide',
        description: 'Build modern web applications with React.js',
        tags: ['react', 'javascript', 'frontend'],
        image: 'https://via.placeholder.com/400x300?text=React+Guide',
        isPublished: true,
        visibility: 'everyone',
        accessType: 'open',
        price: 0,
        instructorId: instructors[1]._id,
        enrolledUsers: [learners[1]._id, learners[2]._id],
        totalLessons: 5,
        totalRating: 25,
        averageRating: 4.2,
        reviewCount: 6,
      },
      {
        title: 'Node.js Backend Development',
        description: 'Create scalable backend applications with Node.js and Express',
        tags: ['nodejs', 'backend', 'express', 'javascript'],
        image: 'https://via.placeholder.com/400x300?text=Node.js',
        isPublished: false,
        visibility: 'everyone',
        accessType: 'open',
        price: 0,
        instructorId: instructors[1]._id,
        enrolledUsers: [],
        totalLessons: 0,
      },
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

    // Create sample quiz
    const quiz = await Quiz.create({
      courseId: courses[0]._id,
      questions: [
        {
          questionText: 'What does HTML stand for?',
          options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlinks and Text Markup Language'],
          correctAnswers: [0],
          explanation: 'HTML stands for HyperText Markup Language',
          points: 1,
        },
        {
          questionText: 'Which CSS property is used to change font color?',
          options: ['font-color', 'color', 'text-color', 'font'],
          correctAnswers: [1],
          explanation: 'The color property is used to change text color in CSS',
          points: 1,
        },
        {
          questionText: 'What does JavaScript use for comments?',
          options: ['# comment', '/ comment', '// for single line, /* */ for multi-line', '-- comment'],
          correctAnswers: [2],
          explanation: 'JavaScript uses // for single line and /* */ for multi-line comments',
          points: 1,
        },
      ],
      rewards: { first: 10, second: 8, third: 5, fourth: 2 },
      passingScore: 60,
      totalQ: 3,
      isPublished: true,
    });

    console.log('✅ Database seeded successfully!');
    console.log(`
    Sample Data Created:
    - ${instructors.length} Instructors
    - ${learners.length} Learners
    - ${courses.length} Courses
    - ${lessons.length} Lessons
    - ${1} Quiz

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
