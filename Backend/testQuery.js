import connectMongoDB from './utils/db.js';
import { User } from './models/user.model.js';
import { Post } from './models/post.model.js';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await connectMongoDB();
  const bhavesh = await User.findOne({ username: 'bhavesh_newest' });
  const currentUserId = bhavesh._id;
  const connectionIds = bhavesh.connections;
  const posts = await Post.find({
    $or: [
      { visibility: 'public' },
      { author: currentUserId },
      { visibility: 'close_friends', author: { $in: connectionIds } },
      { visibility: 'connections', author: { $in: connectionIds } }
    ]
  }).populate('author', 'username').sort({ createdAt: -1 });

  console.log(JSON.stringify(posts.map(p => ({
    id: p._id, author: p.author.username, visibility: p.visibility, caption: p.caption
  })), null, 2));
  process.exit(0);
}
run();
