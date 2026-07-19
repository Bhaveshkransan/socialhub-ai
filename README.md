# SocialHub AI 🚀

Welcome to **SocialHub AI** — a next-generation, AI-powered social connectivity platform built on the modern MERN stack. SocialHub AI reimagines social media with a sleek, responsive design and robust real-time features.

## ✨ Features

- **Real-Time Messaging:** Instant, lag-free chat powered by Socket.io.
- **Dynamic Explore Grid:** Discover trending posts, photos, and short films in a beautiful masonry layout.
- **Rich Media Uploads:** Seamless image and video uploads powered by Cloudinary integration.
- **User Authentication:** Secure JWT-based login and signup system.
- **Sleek UI/UX:** Fully responsive design with an integrated Dark Mode toggle and smooth micro-animations.
- **State Management:** Highly optimized frontend state handled by Redux Toolkit.

## 🛠️ Tech Stack

**Frontend:**
- React 18 (Vite)
- Tailwind CSS
- Redux Toolkit
- Lucide React (Icons)
- Axios

**Backend:**
- Node.js & Express
- MongoDB & Mongoose
- Socket.io (WebSockets)
- Cloudinary (Media Storage)
- JWT (Authentication)
- Razorpay (Payments)

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
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
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
