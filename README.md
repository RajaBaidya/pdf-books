# MERN Stack Todo App

A simple Todo application built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- Create, read, update, and delete todos
- Mark todos as completed/uncompleted
- Clean and responsive UI with Tailwind CSS

## Project Structure

- `client/`: React frontend (built with Vite)
- `server/`: Express backend

## Installation

### Prerequisites

- Node.js (v14+)
- MongoDB (local or MongoDB Atlas)

### Server Setup

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the server directory with your MongoDB URI:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/mern-app
   ```
   
4. Start the server:
   ```
   npm run dev
   ```

### Client Setup

1. Navigate to the client directory:
   ```
   cd client
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the client:
   ```
   npm run dev
   ```

## Usage

- The client will run on `http://localhost:5173`
- The server will run on `http://localhost:5000`
- Create new todos, mark them as completed, and delete them as needed

## Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, MongoDB
- **API**: REST API with Axios for client-side requests 