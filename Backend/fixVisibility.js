import connectMongoDB from './utils/db.js';
import { Post } from './models/post.model.js';
import dotenv from 'dotenv';
dotenv.config();

async function fix() {
  await connectMongoDB();
  const result = await Post.updateMany(
    { visibility: { $exists: false } },
    { $set: { visibility: 'public' } }
  );
  console.log('Updated posts:', result.modifiedCount);
  process.exit(0);
}
fix();
