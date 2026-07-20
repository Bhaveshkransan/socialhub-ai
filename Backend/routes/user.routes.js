import express from "express";
import { register, login, logout, getProfile, editProfile, SuggestedUsers, followOrUnfollow, searchUsers, toggleCloseFriend, sendConnectionRequest, acceptConnectionRequest, rejectConnectionRequest, removeConnection } from "../controllers/user.controller.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js"
import upload from "../middleware/multer.js";

const router = express.Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/search').get(isAuthenticated, searchUsers);
router.route('/:id/profile').get(isAuthenticated,getProfile);
router.route('/profile/edit').post(isAuthenticated,upload.single('profilePicture'),editProfile)
router.route('/suggested').get(isAuthenticated,SuggestedUsers)
router.route('/followOrUnfollow/:id').get(isAuthenticated,followOrUnfollow)
router.route('/closefriend/:id').post(isAuthenticated, toggleCloseFriend);
router.route('/connection-request/:id').post(isAuthenticated, sendConnectionRequest);
router.route('/connection-request/:id/accept').post(isAuthenticated, acceptConnectionRequest);
router.route('/connection-request/:id/reject').post(isAuthenticated, rejectConnectionRequest);
router.route('/connection/remove/:id').post(isAuthenticated, removeConnection);

router.route('/debug/fix-connections').get(async (req, res) => {
    try {
        const User = (await import('../models/user.model.js')).User;
        const bye = await User.findOne({ username: 'bye' });
        const bhavesh = await User.findOne({ username: 'bhavesh_newest' });
        if (bye && bhavesh) {
            // Force sync both directions if one has it
            const byeHasBhavesh = bye.connections.some(id => id.toString() === bhavesh._id.toString());
            const bhaveshHasBye = bhavesh.connections.some(id => id.toString() === bye._id.toString());
            
            if (byeHasBhavesh || bhaveshHasBye) {
                if (!byeHasBhavesh) bye.connections.push(bhavesh._id);
                if (!bhaveshHasBye) bhavesh.connections.push(bye._id);
            }
            
            // Clean up any pending requests
            bye.sentConnectionRequests = bye.sentConnectionRequests.filter(id => id.toString() !== bhavesh._id.toString());
            bye.receivedConnectionRequests = bye.receivedConnectionRequests.filter(id => id.toString() !== bhavesh._id.toString());
            bhavesh.sentConnectionRequests = bhavesh.sentConnectionRequests.filter(id => id.toString() !== bye._id.toString());
            bhavesh.receivedConnectionRequests = bhavesh.receivedConnectionRequests.filter(id => id.toString() !== bye._id.toString());

            await Promise.all([bye.save(), bhavesh.save()]);
            return res.json({ success: true, message: "Fixed connections", byeHasBhavesh, bhaveshHasBye });
        }
        res.json({ success: false, message: "Users not found" });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.route('/debug/users').get(async (req, res) => {
    try {
        const User = (await import('../models/user.model.js')).User;
        const users = await User.find({ username: { $in: ['bye', 'bhavesh_newest'] } }).select('username connections sentConnectionRequests receivedConnectionRequests');
        res.json(users);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

export default router