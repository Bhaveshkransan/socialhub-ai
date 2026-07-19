import mongoose from "mongoose";
import dns from "dns";
import dotenv from "dotenv";
dotenv.config();

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const uri = process.env.MONGO_URI;

mongoose.connect(uri).then(async () => {
    console.log("Connected to MongoDB!");
    const db = mongoose.connection.db;
    
    const users = await db.collection("users").find({}).toArray();
    console.log("USERS IN DB:", users.length);
    if (users.length > 0) {
        console.log("User details:");
        users.forEach(u => console.log(`- ${u.username} (${u._id})`));
    }

    const posts = await db.collection("posts").find({}).toArray();
    console.log("POSTS IN DB:", posts.length);
    if (posts.length > 0) {
        console.log("Post authors:");
        posts.forEach(p => console.log(`- Post ID: ${p._id}, Author: ${p.author}`));
    }
    
    mongoose.connection.close();
}).catch(err => {
    console.error("Connection error:", err);
});
