# Algo Vista

Algo Vista is a gamified algorithm learning platform and universe built on the MERN stack. It empowers users to master algorithms through interactive visualizations, coding battles, and daily challenges.

## 🚀 Tech Stack

This project uses a decoupled Client-Server architecture:

- **Frontend**: Next.js (React), Tailwind CSS, Framer Motion, and Radix UI primitives.
- **Backend**: Node.js and Express.js (Located in the `/backend` directory).
- **Database**: MongoDB (via Mongoose).
- **Authentication**: Custom JWT-based authentication.

## 📂 Project Structure

\`\`\`text
.
├── backend/                # Express.js REST API
│   ├── src/
│   │   ├── models/         # Mongoose Schemas (User, Tasks, etc.)
│   │   ├── routes/         # Express API Routes
│   │   ├── middleware/     # Auth and validation middleware
│   │   └── server.ts       # Backend entry point
│   ├── package.json
│   └── .env                # Backend environment variables (PORT, MONGODB_URI, JWT_SECRET)
│
├── src/                    # Next.js Frontend App
│   ├── app/                # Next.js App Router pages (Dashboard, Sprint, Profile)
│   ├── components/         # Reusable React components (UI, Auth, AI Mentor)
│   ├── contexts/           # React Contexts (AuthContext)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities and API Client (apiClient.ts)
│   └── services/           # Frontend service layer (HTTP wrappers for the backend API)
│
├── package.json            # Frontend dependencies
└── .env                    # Frontend environment variables (NEXT_PUBLIC_API_URL)
\`\`\`

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local instance or MongoDB Atlas cluster)

### 1. Setup the Backend
Navigate to the backend directory, install dependencies, and start the development server:

\`\`\`bash
cd backend
npm install

# Create your .env file
echo "PORT=5000" > .env
echo "MONGODB_URI=mongodb://localhost:27017/algovista" >> .env
echo "JWT_SECRET=your_super_secret_key" >> .env

# Run the backend dev server
npm run dev
\`\`\`

### 2. Setup the Frontend
In a new terminal, install the frontend dependencies from the root directory and start the Next.js development server:

\`\`\`bash
npm install

# Create your frontend .env file
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env

# Run the Next.js frontend dev server
npm run dev
\`\`\`

The frontend will be available at [http://localhost:9002](http://localhost:9002).

## 📝 Key Features

- **Gamified Learning**: Earn XP and build streaks by completing algorithms and challenges.
- **AI Mentor**: Get AI-powered guidance on difficult concepts.
- **Revision & Daily Plans**: Spaced repetition logic to help master weak topics.
- **Custom APIs**: Full CRUD operations routed through the Express backend using secure JWTs.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.
