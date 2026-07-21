import connectMongoDB from './utils/db.js';
import { Post } from './models/post.model.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await connectMongoDB();
  const post = await Post.findById('6a586ada08c33649dadd289f').lean();
  console.log(post);
  process.exit(0);
}
run();
