# SocialHub AI 🚀

Welcome to **SocialHub AI** — a next-generation, AI-powered social connectivity platform built on the modern MERN stack. SocialHub AI reimagines social media with a sleek, responsive design, robust real-time features, and granular privacy controls.

### 🔗 Live Links
- **Live Demo (Frontend):** [https://socialhub-ai-ten.vercel.app](https://socialhub-ai-ten.vercel.app)
- **Backend API:** [https://socialhub-ai.onrender.com](https://socialhub-ai.onrender.com)

## ✨ Key Features

- **Granular Privacy Controls:** Advanced post visibility settings allowing users to share posts with "Public", "Connections Only", or "Close Friends".
- **Real-Time Messaging:** Instant, lag-free chat powered by Socket.io, including typing indicators and online statuses.
- **Dynamic Explore Grid:** Discover trending posts, photos, and short films in a beautiful masonry layout.
- **Rich Media Uploads:** Seamless image and video uploads powered by Cloudinary integration.
- **Bulletproof Authentication:** Secure JWT-based login and signup system using robust header-based authorization to bypass cross-site cookie restrictions.
- **Sleek UI/UX:** Fully responsive design built with TailwindCSS and Shadcn UI, featuring an integrated Dark Mode toggle and smooth micro-animations.
- **State Management:** Highly optimized frontend state handled by Redux Toolkit (Redux Persist).

## 🛠️ Tech Stack

**Frontend:**
- React 18 (Vite)
- Tailwind CSS & Shadcn UI
- Redux Toolkit (State Management)
- Lucide React (Icons)
- Axios (API Client with Interceptors)

**Backend:**
- Node.js & Express
- MongoDB & Mongoose
- Socket.io (WebSockets for Real-Time Chat)
- Cloudinary (Media Storage)
- JSON Web Tokens (Authentication)
- Bcryptjs (Password Hashing)

## 🚀 Getting Started

Follow these steps to run the project locally on your machine.

### 1. Clone the Repository
```bash
git clone https://github.com/Bhaveshkransan/socialhub-ai.git
cd socialhub-ai
```

### 2. Backend Setup
```bash
cd Backend
npm install
```
Create a `.env` file inside the `Backend` directory and add your environment variables:
```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
SECRET_KEY=your_jwt_secret
CLOUDINAY_KEY=your_cloudinary_key
CLOUDINARY_SECRET=your_cloudinary_secret
CLOUD_NAME=your_cloudinary_name
FRONTEND_URL=http://localhost:5173
```
Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal window and navigate to the frontend directory:
```bash
cd Frontend
npm install
```
Start the React development server:
```bash
npm run dev
```

### 4. Enjoy!
Open your browser and navigate to `http://localhost:5173` to explore SocialHub AI!

---
*Built with ❤️ for the future of social networking.*
