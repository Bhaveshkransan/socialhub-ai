import express from "express";
import { AddNewPost, getAllPost, getUserPost, likePost, disLikePost, addComment, getCommentsOfPost, deletePost, bookMarkPost, recordView, changePostVisibility } from "../controllers/post.controller.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.route("/addpost").post(isAuthenticated, upload.single("image"), AddNewPost);
router.route("/all").get(isAuthenticated, getAllPost);
router.route("/userpost/all").get(isAuthenticated, getUserPost);
router.route("/:id/like").get(isAuthenticated, likePost);
router.route("/:id/dislike").get(isAuthenticated, disLikePost);
router.route("/:id/comment").post(isAuthenticated, addComment);
router.route("/:id/comment/all").get(isAuthenticated, getCommentsOfPost);
router.route("/delete/:id").delete(isAuthenticated, deletePost);
router.route("/:id/bookmark").get(isAuthenticated, bookMarkPost);
router.route("/:id/view").post(isAuthenticated, recordView);
router.route("/:id/visibility").post(isAuthenticated, changePostVisibility);

export default router;
