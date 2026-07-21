import connectMongoDB from './utils/db.js';
import { Post } from './models/post.model.js';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await connectMongoDB();
  const post = await Post.findById('6a586ada08c33649dadd289f');
  console.log('Visibility:', JSON.stringify(post.visibility));
  process.exit(0);
}
run();
