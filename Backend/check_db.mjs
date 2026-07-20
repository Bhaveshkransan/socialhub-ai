import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Post } from './models/post.model.js';
import { User } from './models/user.model.js';

dotenv.config({path: './.env'});
mongoose.connect(process.env.MONGO_URI).then(async () => {
    const posts = await Post.find().populate('author', 'username');
    console.log('Posts:');
    posts.forEach(p => {
        console.log(`Author: ${p.author?.username}, Caption: ${p.caption}, Visibility: ${p.visibility}`);
    });
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
