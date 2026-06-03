const Post = require("../models/Post");
const Notification = require("../models/Notification");

const postPopulate = [
  { path: "userId", select: "username email" },
  { path: "comments.userId", select: "username email" },
];

async function createPost(req, res, next) {
  try {
    const { text = "", image = "" } = req.body;
    const trimmedText = text.trim();

    if (!trimmedText && !image) {
      return res.status(400).json({ message: "Add text, an image, or both before posting." });
    }

    const post = await Post.create({
      userId: req.user._id,
      text: trimmedText,
      image,
    });

    const populatedPost = await post.populate(postPopulate);
    res.status(201).json(populatedPost);
  } catch (error) {
    next(error);
  }
}

async function deletePost(req, res, next) {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own post." });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted successfully." });
  } catch (error) {
    next(error);
  }
}

async function getPosts(req, res, next) {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 30);
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate(postPopulate),
      Post.countDocuments(),
    ]);

    res.json({
      posts,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    next(error);
  }
}

async function toggleLike(req, res, next) {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    const userId = req.user._id.toString();
    const alreadyLiked = post.likes.some((likeId) => likeId.toString() === userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter((likeId) => likeId.toString() !== userId);
    } else {
      post.likes.push(req.user._id);

      if (post.userId.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipientId: post.userId,
          actorId: req.user._id,
          postId: post._id,
          type: "like",
        });
      }
    }

    await post.save();
    const populatedPost = await post.populate(postPopulate);
    res.json(populatedPost);
  } catch (error) {
    next(error);
  }
}

async function addComment(req, res, next) {
  try {
    const { text = "" } = req.body;
    const trimmedText = text.trim();

    if (!trimmedText) {
      return res.status(400).json({ message: "Comment text is required." });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    post.comments.push({
      userId: req.user._id,
      text: trimmedText,
    });

    if (post.userId.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipientId: post.userId,
        actorId: req.user._id,
        postId: post._id,
        commentId: post.comments[post.comments.length - 1]._id,
        type: "comment",
      });
    }

    await post.save();
    const populatedPost = await post.populate(postPopulate);
    res.status(201).json(populatedPost);
  } catch (error) {
    next(error);
  }
}

async function deleteComment(req, res, next) {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    const isCommentOwner = comment.userId.toString() === req.user._id.toString();
    const isPostOwner = post.userId.toString() === req.user._id.toString();

    if (!isCommentOwner && !isPostOwner) {
      return res.status(403).json({ message: "You can only delete your own comments." });
    }

    comment.deleteOne();
    await post.save();

    const populatedPost = await post.populate(postPopulate);
    res.json(populatedPost);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createPost,
  getPosts,
  toggleLike,
  addComment,
  deletePost,
  deleteComment,
};
