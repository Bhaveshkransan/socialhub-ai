import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/user.model.js';

dotenv.config({path: './.env'});

mongoose.connect(process.env.MONGO_URI).then(async () => {
    try {
        const users = await User.find({ username: { $in: ['bye', 'bhavesh_newest'] } })
            .select('username connections sentConnectionRequests receivedConnectionRequests');
        
        console.log(JSON.stringify(users, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
});
