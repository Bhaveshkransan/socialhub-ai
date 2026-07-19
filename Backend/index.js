import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from 'dotenv';
import connectMongoDB from "./utils/db.js";
import userRoute from './routes/user.routes.js'
import postRoute from './routes/post.routes.js'
import messageRoute from './routes/message.routes.js'
import notificationRoute from './routes/notification.route.js'
import paymentRoute from './routes/payment.routes.js'
import {app,server} from "./socket/socket.js"

dotenv.config({})

const PORT = process.env.PORT || 3000

app.get("/", (_,res) => {
  return res.status(200).json({
    message: "I'm coming from backend",
    success: true,
  });
});

app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));

const CorsOption = {
  origin: ["http://localhost:5173", "http://localhost:5174", process.env.FRONTEND_URL],
  credentials: true,
};

app.use(cors(CorsOption));

app.use('/api/v1/user/', userRoute)
app.use('/api/v1/post/', postRoute)
app.use('/api/v1/message/', messageRoute)
app.use('/api/v1/notification/', notificationRoute)
app.use('/api/v1/payment/', paymentRoute)


connectMongoDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server listening at port ${PORT}`);
  });
});
