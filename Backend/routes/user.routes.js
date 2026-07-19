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

export default router