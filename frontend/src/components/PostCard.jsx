import { useState } from "react";
import { useTheme } from "@mui/material/styles";
import { Heart, MessageSquare, Send, Share2, Trash2 } from "lucide-react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { apiRequest } from "../api";

function getInitials(name = "U") {
  return name.slice(0, 2).toUpperCase();
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function PostCard({ post, currentUser, onPostUpdated }) {
  const theme = useTheme();
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [commentsOpen, setCommentsOpen] = useState(false);
  const currentUserId = currentUser?.id || currentUser?._id;
  const liked = post.likes?.some((id) => id === currentUserId || id?._id === currentUserId);
  const canDeletePost = currentUserId && post.userId?._id === currentUserId;

  async function handleLike() {
    setError("");
    if (!currentUserId) {
      setError("Please sign in to like posts.");
      return;
    }

    onPostUpdated({
      ...post,
      likes: liked
        ? post.likes.filter((id) => (id?._id || id) !== currentUserId)
        : [...post.likes, currentUserId],
    });

    try {
      const updated = await apiRequest(`/posts/${post._id}/like`, { method: "PUT" });
      onPostUpdated(updated);
    } catch (err) {
      setError(err.message);
      onPostUpdated(post);
    }
  }

  async function handleComment(event) {
    event.preventDefault();
    if (!comment.trim()) return;

    if (!currentUserId) {
      setError("Please sign in to comment.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const updated = await apiRequest(`/posts/${post._id}/comment`, {
        method: "POST",
        body: JSON.stringify({ text: comment }),
      });
      onPostUpdated(updated);
      setComment("");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDeletePost() {
    if (!currentUserId) {
      setError("Please sign in to delete posts.");
      return;
    }

    if (!window.confirm("Delete this post?")) return;

    setBusy(true);
    setError("");

    try {
      await apiRequest(`/posts/${post._id}`, { method: "DELETE" });
      onPostUpdated({ _id: post._id, deleted: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteComment(commentId) {
    if (!currentUserId) {
      setError("Please sign in to delete comments.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const updated = await apiRequest(`/posts/${post._id}/comments/${commentId}`, {
        method: "DELETE",
      });
      onPostUpdated(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card
      component="article"
      elevation={0}
      sx={{
        p: 3,
        borderRadius: "16px",
        boxShadow: "none",
        backgroundColor: theme.palette.background.paper,
        border: theme.palette.mode === "dark" ? "1px solid rgba(148, 163, 184, 0.16)" : "1px solid #e7ecf4",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: "14px", mb: "18px" }}>
        <Box
          sx={{
            width: 58,
            height: 58,
            display: "grid",
            placeItems: "center",
            borderRadius: "50%",
            color: "#ffffff",
            background: "linear-gradient(135deg, #0f172a, #3b82f6)",
            fontWeight: 900,
          }}
        >
          {getInitials(post.userId?.username)}
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 900, fontSize: "1.06rem" }}>
            <Typography component="span" sx={{ fontWeight: 900, fontSize: "1.06rem", color: theme.palette.text.primary }}>
              {post.userId?.username || "Unknown user"}
            </Typography>
            <Typography component="span" sx={{ color: "#facc15" }}>
              ★
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: "#64748b", mt: "4px" }}>
            {formatDate(post.createdAt)}
          </Typography>
        </Box>

        <Box sx={{ ml: "auto", display: "flex", alignItems: "center" }}>
          <Button
            type="button"
            onClick={handleDeletePost}
            disabled={busy || !canDeletePost}
            aria-label="Delete post"
            title={canDeletePost ? "Delete post" : "Only the post owner can delete this post"}
            sx={{
              minWidth: 0,
              width: 42,
              height: 42,
              minHeight: 42,
              p: 0,
              borderRadius: "12px",
              color: "#94a3b8",
              backgroundColor: "transparent",
              '&:hover': {
                backgroundColor: "rgba(15, 23, 42, 0.04)",
                color: "#ef4444",
              },
            }}
          >
            <Trash2 size={18} />
          </Button>
        </Box>
      </Box>

      {post.text && (
        <Typography
          variant="body1"
          sx={{
            mb: "18px",
            color: theme.palette.text.primary,
            fontSize: "1.08rem",
            lineHeight: 1.55,
          }}
        >
          {post.text}
        </Typography>
      )}

      {post.image && (
        <Box
          component="img"
          src={post.image}
          alt="Post attachment"
          sx={{
            width: "100%",
            maxHeight: 520,
            objectFit: "cover",
            borderRadius: "16px",
            border: theme.palette.mode === "dark" ? "1px solid rgba(148, 163, 184, 0.16)" : "1px solid #edf1f7",
          }}
        />
      )}

      <Box
        sx={{
          mt: "20px",
          pt: "18px",
          display: "grid",
          gap: "14px",
          borderTop: "1px solid #edf1f7",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px", color: theme.palette.text.secondary, fontSize: "0.95rem" }}>
          <Box
            sx={{
              width: 18,
              height: 18,
              display: "grid",
              placeItems: "center",
              borderRadius: "999px",
              color: "#ffffff",
              background: "linear-gradient(135deg, #2563eb, #60a5fa)",
            }}
          >
            <Heart size={12} fill="currentColor" />
          </Box>
          <Typography sx={{ color: theme.palette.text.secondary }}>{post.likes?.length || 0}</Typography>
          <Typography sx={{ color: theme.palette.text.secondary }}>•</Typography>
          <Typography sx={{ color: theme.palette.text.secondary }}>{post.comments?.length || 0} comments</Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: theme.palette.text.secondary,
            fontSize: "0.95rem",
            pb: "8px",
            borderBottom: theme.palette.mode === "dark" ? "1px solid rgba(148, 163, 184, 0.16)" : "1px solid #edf1f7",
          }}
        >
          <Typography>{post.likes?.length || 0} likes</Typography>
          <Typography>{post.comments?.length || 0} comments</Typography>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "10px" }}>
          <Button
            type="button"
            variant="contained"
            onClick={handleLike}
            disableElevation
            sx={{
              minHeight: 46,
              minWidth: 0,
              borderRadius: "12px",
              color: liked ? "#2563eb" : theme.palette.text.primary,
              backgroundColor: liked ? "#eef4ff" : theme.palette.background.default,
              textTransform: "none",
              fontWeight: 800,
              gap: "10px",
              '&:hover': {
                backgroundColor: theme.palette.mode === "dark" ? "rgba(148, 163, 184, 0.12)" : "#eef4ff",
              },
            }}
            startIcon={<Heart size={20} fill={liked ? "currentColor" : "none"} />}
          >
            Like
          </Button>
          <Button
            type="button"
            variant="contained"
            onClick={() => setCommentsOpen((current) => !current)}
            disableElevation
            sx={{
              minHeight: 46,
              minWidth: 0,
              borderRadius: "12px",
              color: commentsOpen ? "#2563eb" : theme.palette.text.primary,
              backgroundColor: commentsOpen ? "#eef4ff" : theme.palette.background.default,
              textTransform: "none",
              fontWeight: 800,
              gap: "10px",
              '&:hover': {
                backgroundColor: theme.palette.mode === "dark" ? "rgba(148, 163, 184, 0.12)" : "#eef4ff",
              },
            }}
            startIcon={<MessageSquare size={20} />}
          >
            Comment
          </Button>
          <Button
            type="button"
            variant="contained"
            disableElevation
            sx={{
              minHeight: 46,
              minWidth: 0,
              borderRadius: "12px",
              color: theme.palette.text.primary,
              backgroundColor: theme.palette.background.default,
              textTransform: "none",
              fontWeight: 800,
              gap: "10px",
              '&:hover': {
                backgroundColor: theme.palette.mode === "dark" ? "rgba(148, 163, 184, 0.12)" : "#eef4ff",
              },
            }}
            aria-label="Repost post"
            startIcon={<Share2 size={18} />}
          >
            Repost
          </Button>
          <Button
            type="button"
            variant="contained"
            disableElevation
            sx={{
              minHeight: 46,
              minWidth: 0,
              borderRadius: "12px",
              color: theme.palette.text.primary,
              backgroundColor: theme.palette.background.default,
              textTransform: "none",
              fontWeight: 800,
              gap: "10px",
              '&:hover': {
                backgroundColor: theme.palette.mode === "dark" ? "rgba(148, 163, 184, 0.12)" : "#eef4ff",
              },
            }}
            aria-label="Send post"
            startIcon={<Send size={18} />}
          >
            Send
          </Button>
        </Box>
      </Box>

      {commentsOpen && post.comments?.length > 0 && (
        <Box sx={{ display: "grid", gap: "12px", mt: "20px", pl: "18px", borderLeft: theme.palette.mode === "dark" ? "2px solid rgba(148, 163, 184, 0.16)" : "2px solid #e5edf7" }}>
          {post.comments.slice(-3).map((item) => (
            <Box key={item._id} sx={{ display: "flex", gap: "10px", alignItems: "flex-start", color: theme.palette.text.primary }}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  flexShrink: 0,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #cbd5e1, #94a3b8)",
                  color: "#ffffff",
                  fontSize: "0.78rem",
                  fontWeight: 900,
                }}
              >
                {getInitials(item.userId?.username)}
              </Box>
              <Box sx={{ flex: 1, p: "10px 12px", borderRadius: "12px", backgroundColor: theme.palette.background.default }}>
                <Typography component="strong" sx={{ display: "block", color: theme.palette.text.primary, fontWeight: 700 }}>
                  {item.userId?.username || "User"}
                </Typography>
                <Typography component="span" sx={{ display: "block", mt: "4px", lineHeight: 1.45, color: theme.palette.text.primary }}>
                  {item.text}
                </Typography>
              </Box>
              <Button
                type="button"
                onClick={() => handleDeleteComment(item._id)}
                disabled={busy}
                aria-label="Delete comment"
                title="Delete comment"
                sx={{
                  minWidth: 0,
                  width: 42,
                  height: 42,
                  minHeight: 42,
                  p: 0,
                  borderRadius: "12px",
                  color: "#94a3b8",
                  backgroundColor: "transparent",
                  '&:hover': {
                    backgroundColor: "rgba(15, 23, 42, 0.04)",
                    color: "#ef4444",
                  },
                }}
              >
                <Trash2 size={15} />
              </Button>
            </Box>
          ))}
        </Box>
      )}

      {commentsOpen && (
        <Box
          component="form"
          onSubmit={handleComment}
          sx={{ display: "grid", gridTemplateColumns: "1fr 46px", gap: "10px", mt: "16px" }}
        >
          <TextField
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment..."
            disabled={busy}
            fullWidth
            variant="outlined"
            size="small"
            InputProps={{
              sx: {
                borderRadius: "999px",
                minHeight: 46,
                backgroundColor: theme.palette.background.default,
                '& fieldset': {
                  borderColor: theme.palette.mode === "dark" ? "rgba(148, 163, 184, 0.16)" : "#dbe3ee",
                },
                '&:hover fieldset': {
                  borderColor: "#dbe3ee",
                },
                '&.Mui-focused fieldset': {
                  borderColor: "#3b82f6",
                },
              },
            }}
            sx={{
              '& .MuiOutlinedInput-input': {
                padding: "13px 16px",
                height: "auto",
              },
            }}
          />
          <Button
            type="submit"
            disabled={busy || !comment.trim()}
            aria-label="Add comment"
            variant="contained"
            disableElevation
            sx={{
              minWidth: 46,
              minHeight: 46,
              width: 46,
              height: 46,
              p: 0,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #2563eb, #3b82f6)",
              color: "#ffffff",
              '&:hover': {
                background: "#2563eb",
              },
            }}
          >
            <Send size={17} />
          </Button>
        </Box>
      )}

      {error && (
        <Box
          sx={{
            mt: "10px",
            p: "9px 12px",
            fontSize: "0.9rem",
            border: "1px solid #fecaca",
            borderRadius: "12px",
            backgroundColor: "#fff1f2",
            color: "#991b1b",
            fontWeight: 700,
          }}
        >
          {error}
        </Box>
      )}
    </Card>
  );
}

export default PostCard;
