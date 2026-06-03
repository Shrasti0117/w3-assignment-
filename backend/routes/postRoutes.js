const express = require("express");
const {
  createPost,
  getPosts,
  toggleLike,
  addComment,
  deletePost,
  deleteComment,
} = require("../controllers/postController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getPosts);
router.post("/", protect, createPost);
router.put("/:id/like", protect, toggleLike);
router.post("/:id/comment", protect, addComment);
router.delete("/:id", protect, deletePost);
router.delete("/:id/comments/:commentId", protect, deleteComment);

module.exports = router;
