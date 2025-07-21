# Gym Management System Backend

## Setup

1. Install dependencies:
   ```
npm install
   ```
2. Create a `.env` file with:
   ```
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=5000
   ```
3. Start the server:
   ```
npm run dev
   ```

## Features
- JWT Auth (Admin/Trainer/Member)
- Admin user seeded on first run (admin@gym.com / Admin123!)
- Role-based access middleware
- REST API for authentication and user management

## Project Structure
- `app.js` - Entry point
- `models/` - Mongoose models
- `controllers/` - Route logic
- `routes/` - Express routers
- `middleware/` - Auth/role middleware
- `utils/` - Helper functions 