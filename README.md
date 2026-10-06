# Second Brain

A full-stack platform to manage links, notes and documents with AI-powered search, built with React, Node.js, Express, and MongoDB.

## Features

- **Notes, Links, & Documents**: Manage your personal knowledge base
- **AI Assistant**: Ask questions and get answers based on your saved content (powered by Groq API + local embeddings)
- **Role-based Authentication**: Secure JWT auth with user and admin roles
- **Public Sharing**: Share notes, links, or documents publicly via unique links
- **Search & Filtering**: Filter by tags, search text, and sort by date/title
- **Premium UI**: Dark mode, glassmorphism, responsive mobile-first design
- **Code-Splitting**: React.lazy for optimized frontend loading

## Prerequisites

- Node.js (v18+)
- MongoDB connection string (e.g., MongoDB Atlas)
- Groq API Key

## Environment Setup

1. Copy the example `.env` file in the server directory:
   ```bash
   cp server/.env.example server/.env
   ```
2. Update `server/.env` with your actual MongoDB URI, JWT secret, and Groq API key.

## Installation & Running

1. Install all dependencies:
   ```bash
   npm run install-all
   ```

2. Start the development server (runs both client and server concurrently):
   ```bash
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Technologies Used

- **Frontend**: React, Vite, Tailwind CSS v3, React Router, Axios, Lucide React
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT, Bcrypt
- **AI/ML**: Groq SDK (`llama-3.3-70b-versatile`), `@xenova/transformers` (`all-MiniLM-L6-v2` for local embeddings)
