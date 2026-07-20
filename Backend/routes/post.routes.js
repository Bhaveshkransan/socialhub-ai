import express from "express";
import { AddNewPost, getAllPost, getUserPost, likePost, disLikePost, addComment, getCommentsOfPost, deletePost, bookMarkPost, recordView, changePostVisibility } from "../controllers/post.controller.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.route("/addpost").post(isAuthenticated, upload.single("image"), AddNewPost);
router.route('/all').get(isAuthenticated, getAllPost);
router.route('/userpost/all').get(isAuthenticated, getUserPost);

router.route('/debug-bye-posts').get(async (req, res) => {
    try {
        const User = (await import('../models/user.model.js')).User;
        const Post = (await import('../models/post.model.js')).Post;
        
        const bye = await User.findOne({ username: 'bye' });
        const bhavesh = await User.findOne({ username: 'bhavesh_newest' });
        
        if (!bye || !bhavesh) return res.json({ error: "users not found" });

        const connectionIds = bye.connections;
        const bhaveshPosts = await Post.find({ author: bhavesh._id }).populate("author", "username");
        const posts = await Post.find({
            $or: [
                { visibility: "public" },
                { author: bye._id },
                { visibility: "close_friends", author: { $in: connectionIds } },
                { visibility: "connections", author: { $in: connectionIds } }
            ]
        }).populate("author", "username");

        res.json({
            byeConnections: connectionIds,
            bhaveshId: bhavesh._id,
            bhaveshAllPosts: bhaveshPosts.map(p => ({
                id: p._id,
                visibility: p.visibility,
                caption: p.caption
            })),
            postsReturnedForBye: posts.map(p => ({
                id: p._id,
                author: p.author.username,
                visibility: p.visibility,
                caption: p.caption
            }))
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});
router.route("/:id/like").get(isAuthenticated, likePost);
router.route("/:id/dislike").get(isAuthenticated, disLikePost);
router.route("/:id/comment").post(isAuthenticated, addComment);
router.route("/:id/comment/all").get(isAuthenticated, getCommentsOfPost);
router.route("/delete/:id").delete(isAuthenticated, deletePost);
router.route("/:id/bookmark").get(isAuthenticated, bookMarkPost);
router.route("/:id/view").post(isAuthenticated, recordView);
router.route("/:id/visibility").post(isAuthenticated, changePostVisibility);

export default router;
