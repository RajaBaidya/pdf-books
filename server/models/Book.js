import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String, // URL to the cover image
      required: true,
    },
    fileUrl: {
      type: String, // URL to the book file (PDF)
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    publishedYear: {
      type: Number,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

const Book = mongoose.model('Book', bookSchema);

export default Book; 