const mongoose = require('mongoose');
require('dotenv').config({path: 'Backend/.env'});
mongoose.connect(process.env.MONGO_URI).then(async () => {
    const Post = require('./Backend/models/post.model.js').Post;
    const User = require('./Backend/models/user.model.js').User;
    
    const posts = await Post.find().populate('author', 'username');
    console.log('Posts:');
    posts.forEach(p => {
        console.log(`Author: ${p.author?.username}, Caption: ${p.caption}, Visibility: ${p.visibility}`);
    });
    process.exit(0);
});
