# TaskPlanet Social MERN App

A full-stack MERN social feed inspired by TaskPlanet. Users can sign up, log in, create text or image posts, like/unlike posts, comment, search the visible feed, and load paginated posts.

## Project Structure

```text
backend/
  controllers/
  middleware/
  models/
  routes/
  server.js

frontend/
  src/
    components/
    pages/
    App.js
```

## Local Setup

1. Install backend dependencies:

```bash
cd backend
npm install
```

2. Create `backend/.env` from `backend/.env.example` and add your MongoDB URI and JWT secret.

3. Start the backend:

```bash
npm run dev
```

4. Install frontend dependencies:

```bash
cd ../frontend
npm install
```

5. Create `frontend/.env` from `frontend/.env.example`.

6. Start the frontend:

```bash
npm run dev
```

## Deployment Notes

- Backend on Render: set `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, and use `npm start`.
- Frontend on Vercel: set `VITE_API_URL` to your Render backend URL plus `/api`.
- Database on MongoDB Atlas: allow Render's deployed backend to connect through Atlas network settings.
