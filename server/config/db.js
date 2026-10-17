const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!uri) {
    console.error('CRITICAL: Neither MONGO_URI nor MONGODB_URI is defined in Environment Variables!');
    console.error('Please configure MONGO_URI in your Render Dashboard -> Environment tab.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error('Checklist:');
    console.error('1. Is your MongoDB Atlas password URL-encoded if it contains special characters?');
    console.error('2. In MongoDB Atlas -> Network Access, is IP 0.0.0.0/0 (Allow from anywhere) enabled?');
    process.exit(1);
  }
};

module.exports = connectDB;
