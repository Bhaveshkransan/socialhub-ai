import connectMongoDB from './utils/db.js';
import { Post } from './models/post.model.js';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await connectMongoDB();
  const posts = await Post.find({
    $or: [
      { visibility: 'public' }
    ]
  });
  console.log('Public posts count:', posts.length);
  posts.forEach(p => console.log(p._id, p.caption));
  process.exit(0);
}
run();
