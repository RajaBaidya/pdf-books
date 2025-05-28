import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Book from '../models/Book.js';

// Load env variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected for seeding'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Create a valid ObjectId for the admin user
const adminId = new mongoose.Types.ObjectId();

// Sample books data
const books = [
  {
    title: 'JavaScript: The Good Parts',
    author: 'Douglas Crockford',
    description: 'Most programming languages contain good and bad parts, but JavaScript has more than its share of the bad, having been developed and released in a hurry before it could be refined.',
    coverImage: 'https://m.media-amazon.com/images/I/81kqrwS1nNL._AC_UF1000,1000_QL80_.jpg',
    fileUrl: '/api/uploads/books/dummy-js-good-parts.pdf',
    category: 'programming',
    publishedYear: 2008,
    isActive: true,
    addedBy: adminId
  },
  {
    title: 'Clean Code',
    author: 'Robert C. Martin',
    description: 'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees. Every year, countless hours and significant resources are lost because of poorly written code.',
    coverImage: 'https://m.media-amazon.com/images/I/41xShlnTZTL._SX376_BO1,204,203,200_.jpg',
    fileUrl: '/api/uploads/books/dummy-clean-code.pdf',
    category: 'programming',
    publishedYear: 2008,
    isActive: true,
    addedBy: adminId
  },
  {
    title: 'Design Patterns',
    author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
    description: 'Capturing a wealth of experience about the design of object-oriented software, four top-notch designers present a catalog of simple and succinct solutions to commonly occurring design problems.',
    coverImage: 'https://m.media-amazon.com/images/I/51szD9HC9pL._SX395_BO1,204,203,200_.jpg',
    fileUrl: '/api/uploads/books/dummy-design-patterns.pdf',
    category: 'programming',
    publishedYear: 1994,
    isActive: true,
    addedBy: adminId
  },
  {
    title: 'Atomic Habits',
    author: 'James Clear',
    description: 'No matter your goals, Atomic Habits offers a proven framework for improving--every day. James Clear, one of the world\'s leading experts on habit formation, reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.',
    coverImage: 'https://m.media-amazon.com/images/I/81wgcld4wxL._AC_UF1000,1000_QL80_.jpg',
    fileUrl: '/api/uploads/books/dummy-atomic-habits.pdf',
    category: 'self-help',
    publishedYear: 2018,
    isActive: true,
    addedBy: adminId
  },
  {
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    description: 'In the international bestseller, Thinking, Fast and Slow, Daniel Kahneman, the renowned psychologist and winner of the Nobel Prize in Economics, takes us on a groundbreaking tour of the mind and explains the two systems that drive the way we think.',
    coverImage: 'https://m.media-amazon.com/images/I/61fdrEuPJwL._AC_UF1000,1000_QL80_.jpg',
    fileUrl: '/api/uploads/books/dummy-thinking-fast-slow.pdf',
    category: 'psychology',
    publishedYear: 2011,
    isActive: true,
    addedBy: adminId
  }
];

// Function to seed database
const seedDatabase = async () => {
  try {
    // Clear existing books
    await Book.deleteMany({});
    console.log('Deleted all existing books');

    // Insert new books
    const insertedBooks = await Book.insertMany(books);
    console.log(`${insertedBooks.length} books inserted successfully`);

    // Disconnect from database
    mongoose.disconnect();
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedDatabase(); 