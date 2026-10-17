const mongoose = require('mongoose');

const connectDB = async () => {
  let rawUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!rawUri) {
    console.error('CRITICAL: Neither MONGO_URI nor MONGODB_URI is defined in Environment Variables!');
    console.error('Please configure MONGO_URI in your Render Dashboard -> Environment tab.');
    process.exit(1);
  }

  // Strip accidental quotes and whitespace
  const uri = rawUri.trim().replace(/^["']|["']$/g, '');

  // Check for literal angle brackets
  if (uri.includes('<') || uri.includes('>')) {
    console.error('CRITICAL ERROR: Your connection string still contains "<" or ">" brackets!');
    console.error('Example: If your password is MyPass123, write :MyPass123@ NOT :<MyPass123>@');
  }

  // Safe masked log
  const maskedUri = uri.replace(/:([^:@]+)@/, ':****@');
  console.log(`Attempting to connect with URI: ${maskedUri}`);

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error('Checklist:');
    console.error('1. Is your password URL-encoded if it contains special characters? (e.g. @ becomes %40)');
    console.error('2. Make sure you removed the "<" and ">" brackets around your password.');
    console.error('3. In MongoDB Atlas -> Network Access, ensure 0.0.0.0/0 (Allow from anywhere) is Active.');
    process.exit(1);
  }
};

module.exports = connectDB;
