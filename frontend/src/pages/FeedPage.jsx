import { useCallback, useEffect, useState } from "react";
import { Bell, Heart, LogOut, MessageSquare, Moon, Search, Sun, Users } from "lucide-react";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { apiRequest } from "../api";
import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";

function formatNotificationDate(dateValue) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function FeedPage({ user, themeMode, onLogout, onToggleTheme }) {
  const theme = useTheme();
  const [posts, setPosts] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  const fetchPosts = useCallback(async (nextPage = 1, append = false) => {
    append ? setLoadingMore(true) : setLoading(true);
    setError("");

    try {
      const data = await apiRequest(`/posts?page=${nextPage}&limit=6`);
      setPosts((current) => (append ? [...current, ...data.posts] : data.posts));
      setPage(data.page);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const fetchNotifications = useCallback(async () => {
    setLoadingNotifications(true);

    try {
      const data = await apiRequest("/notifications");
      setNotifications(data.notifications || []);
    } catch {
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  }, []);

  const markNotificationsAsRead = useCallback(async () => {
    await apiRequest("/notifications/read", { method: "PATCH" });
  }, []);

  useEffect(() => {
    fetchNotifications();

    const timer = setInterval(fetchNotifications, 15000);
    return () => clearInterval(timer);
  }, [fetchNotifications]);

  async function handleNotificationToggle() {
    if (notificationsOpen) {
      setNotificationsOpen(false);
      return;
    }

    await fetchNotifications();
    await markNotificationsAsRead();
    setNotifications((current) => current.map((notification) => ({ ...notification, read: true })));
    setNotificationsOpen(true);
  }

  function upsertPost(updatedPost) {
    if (updatedPost?.deleted) {
      setPosts((current) => current.filter((post) => post._id !== updatedPost._id));
      return;
    }

    setPosts((current) => current.map((post) => (post._id === updatedPost._id ? updatedPost : post)));
  }

  function addPost(newPost) {
    setPosts((current) => [newPost, ...current]);
  }

  function getEngagementScore(post) {
    const likes = post.likes?.length || 0;
    const comments = post.comments?.length || 0;
    return likes * 2 + comments * 3;
  }

  function sortPosts(list) {
    const sorted = [...list];

    if (activeFilter === "trending") {
      return sorted.sort((left, right) => {
        const scoreDifference = getEngagementScore(right) - getEngagementScore(left);
        if (scoreDifference !== 0) return scoreDifference;
        return new Date(right.createdAt) - new Date(left.createdAt);
      });
    }

    if (activeFilter === "liked") {
      return sorted
        .filter((post) => (post.likes?.length || 0) > 0)
        .sort((left, right) => {
          const likeDifference = (right.likes?.length || 0) - (left.likes?.length || 0);
          if (likeDifference !== 0) return likeDifference;
          return new Date(right.createdAt) - new Date(left.createdAt);
        });
    }

    if (activeFilter === "commented") {
      return sorted
        .filter((post) => (post.comments?.length || 0) > 0)
        .sort((left, right) => {
          const commentDifference = (right.comments?.length || 0) - (left.comments?.length || 0);
          if (commentDifference !== 0) return commentDifference;
          return new Date(right.createdAt) - new Date(left.createdAt);
        });
    }

    return sorted;
  }

  const visiblePosts = sortPosts(posts).filter((post) => {
    const query = search.toLowerCase();
    return (
      post.text?.toLowerCase().includes(query) ||
      post.userId?.username?.toLowerCase().includes(query)
    );
  });

  const hasUnreadNotifications = notifications.some((notification) => !notification.read);

  return (
    <Box component="main" sx={{ minHeight: "100vh", backgroundColor: theme.palette.background.default, color: theme.palette.text.primary }}>
      <Box
        component="header"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          backgroundColor: theme.palette.background.paper,
          borderBottom: theme.palette.mode === "dark" ? "1px solid rgba(148, 163, 184, 0.16)" : "1px solid #e5eaf2",
          boxShadow: "0 2px 8px rgba(15, 23, 42, 0.06)",
          backdropFilter: "blur(12px)",
        }}
      >
        <Box
          sx={{
            width: "min(100%, 1580px)",
            minHeight: 78,
            mx: "auto",
            px: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: "12px", color: "#2563eb", fontWeight: 800, fontSize: "1.45rem" }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                display: "grid",
                placeItems: "center",
                color: "#ffffff",
                background: "linear-gradient(135deg, #2563eb, #3b82f6)",
                borderRadius: "14px",
                boxShadow: "0 8px 18px rgba(37, 99, 235, 0.28)",
              }}
            >
              <Users size={24} />
            </Box>
            <Typography component="span">Social</Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <IconButton
              aria-label={themeMode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              title={themeMode === "dark" ? "Light mode" : "Dark mode"}
              onClick={onToggleTheme}
              sx={{
                width: 42,
                height: 42,
                color: theme.palette.mode === "dark" ? "#f8fafc" : "#475569",
                backgroundColor: theme.palette.mode === "dark" ? "rgba(148, 163, 184, 0.16)" : "transparent",
                borderRadius: "12px",
              }}
            >
              {themeMode === "dark" ? <Sun size={22} /> : <Moon size={22} />}
            </IconButton>

            <IconButton
              aria-label="Notifications"
              aria-expanded={notificationsOpen}
              onClick={handleNotificationToggle}
              sx={{
                width: 42,
                height: 42,
                color: notificationsOpen ? "#2563eb" : "#475569",
                backgroundColor: notificationsOpen ? "#eef4ff" : "transparent",
                borderRadius: "12px",
                position: "relative",
              }}
            >
              <Bell size={22} />
              {!notificationsOpen && hasUnreadNotifications && (
                <Box
                  component="span"
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "#ef4444",
                  }}
                />
              )}
            </IconButton>

            <Box
              sx={{
                minWidth: 110,
                height: 50,
                display: "grid",
                placeItems: "center",
                borderRadius: "16px",
                background: "#facc15",
                color: "#111827",
                fontSize: "1.1rem",
                fontWeight: 900,
                boxShadow: "0 10px 18px rgba(250, 204, 21, 0.22)",
              }}
            >
              250
            </Box>

            <Button
              onClick={onLogout}
              title="Logout"
              sx={{
                p: 0,
                minWidth: 54,
                width: 54,
                height: 54,
                borderRadius: "50%",
                color: "#ffffff",
                background: "#0f172a",
                border: "3px solid #3b82f6",
                fontWeight: 900,
                position: "relative",
                '&:hover': {
                  background: "#0b1220",
                },
              }}
            >
              {user?.username?.charAt(0).toUpperCase()}
              <Box
                component="span"
                sx={{
                  position: "absolute",
                  right: -5,
                  bottom: -2,
                  width: 18,
                  height: 18,
                  display: "grid",
                  placeItems: "center",
                  color: "#2563eb",
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: "50%",
                }}
              >
                <LogOut size={13} />
              </Box>
            </Button>
          </Box>
        </Box>
      </Box>

      <Box sx={{ width: "min(100%, 840px)", mx: "auto", px: 2, pb: "40px" }}>
        {notificationsOpen && (
          <Box
            component="button"
            type="button"
            aria-label="Close notifications"
            onClick={() => setNotificationsOpen(false)}
            sx={{
              position: "fixed",
              inset: 0,
              border: 0,
              padding: 0,
              background: "rgba(15, 23, 42, 0.18)",
              backdropFilter: "blur(2px)",
              zIndex: 30,
            }}
          />
        )}

        <Box sx={{ width: "100%", mt: "40px", mx: "auto" }}>
          <Box
            component="label"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              minHeight: 68,
              px: "22px",
              backgroundColor: theme.palette.background.paper,
              border: theme.palette.mode === "dark" ? "1px solid rgba(148, 163, 184, 0.16)" : "1px solid #e3e8f0",
              borderRadius: "18px",
              boxShadow: "0 4px 14px rgba(15, 23, 42, 0.08)",
              color: theme.palette.text.secondary,
            }}
          >
            <Search size={22} />
            <TextField
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users or posts..."
              variant="standard"
              fullWidth
              InputProps={{
                disableUnderline: true,
                sx: {
                  minHeight: 48,
                  backgroundColor: "transparent",
                  fontSize: "1.08rem",
                  color: theme.palette.text.primary,
                  '& input': {
                    padding: 0,
                    minHeight: 48,
                    color: theme.palette.text.primary,
                  },
                },
              }}
              sx={{ color: theme.palette.text.primary }}
            />
          </Box>

          <CreatePost onCreated={addPost} />

          <Box component="nav" aria-label="Feed filters" sx={{ display: "flex", flexWrap: "wrap", gap: "14px", my: "30px" }}>
            {[
              { label: "All Posts", value: "all" },
              { label: "Trending", value: "trending" },
              { label: "Most Liked", value: "liked" },
              { label: "Most Commented", value: "commented" },
            ].map((filter) => (
              <Button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                disableElevation
                sx={{
                  minHeight: 50,
                  borderRadius: "16px",
                  px: "24px",
                  fontWeight: 800,
                  color: activeFilter === filter.value ? "#ffffff" : theme.palette.text.primary,
                  background: activeFilter === filter.value ? "linear-gradient(135deg, #2563eb, #3b82f6)" : theme.palette.background.paper,
                  border: activeFilter === filter.value ? "transparent" : theme.palette.mode === "dark" ? "1px solid rgba(148, 163, 184, 0.16)" : "1px solid #e8edf5",
                  boxShadow: activeFilter === filter.value ? "none" : "0 3px 10px rgba(15, 23, 42, 0.08)",
                  textTransform: "none",
                  '&:hover': {
                    background: activeFilter === filter.value ? "linear-gradient(135deg, #2563eb, #3b82f6)" : theme.palette.mode === "dark" ? "rgba(148, 163, 184, 0.12)" : "#eef4ff",
                  },
                }}
              >
                {filter.label}
              </Button>
            ))}
          </Box>

          {error && (
            <Box
              sx={{
                mb: "18px",
                border: "1px solid #fecaca",
                borderRadius: "12px",
                p: "12px 14px",
                color: "#991b1b",
                background: "#fff1f2",
                fontWeight: 700,
              }}
            >
              {error}
            </Box>
          )}

          {loading && (
            <Box
              sx={{
                p: "24px",
                color: theme.palette.text.secondary,
                textAlign: "center",
                fontWeight: 800,
                backgroundColor: theme.palette.background.paper,
                border: theme.palette.mode === "dark" ? "1px solid rgba(148, 163, 184, 0.16)" : "1px solid #e7ecf4",
                borderRadius: "16px",
                boxShadow: "0 4px 14px rgba(15, 23, 42, 0.08)",
              }}
            >
              Loading posts...
            </Box>
          )}

          {!loading && visiblePosts.length === 0 && (
            <Box
              sx={{
                p: "24px",
                color: theme.palette.text.secondary,
                textAlign: "center",
                fontWeight: 800,
                backgroundColor: theme.palette.background.paper,
                border: theme.palette.mode === "dark" ? "1px solid rgba(148, 163, 184, 0.16)" : "1px solid #e7ecf4",
                borderRadius: "16px",
                boxShadow: "0 4px 14px rgba(15, 23, 42, 0.08)",
              }}
            >
              No posts yet. Start the conversation.
            </Box>
          )}

          <Box sx={{ display: "grid", gap: "24px" }}>
            {visiblePosts.map((post) => (
              <PostCard key={post._id} post={post} currentUser={user} onPostUpdated={upsertPost} />
            ))}
          </Box>

          {page < totalPages && (
            <Button
              onClick={() => fetchPosts(page + 1, true)}
              disabled={loadingMore}
              sx={{
                width: "100%",
                minHeight: 50,
                mt: "24px",
                borderRadius: "14px",
                color: "#ffffff",
                background: "#0f172a",
                fontWeight: 900,
                '&:hover': {
                  background: "#0b1220",
                },
              }}
            >
              {loadingMore ? "Loading..." : "Load more"}
            </Button>
          )}
        </Box>

        <Box
          component="aside"
          sx={{
            position: "fixed",
            top: 92,
            right: 24,
            width: "min(100vw - 48px, 360px)",
            maxHeight: "calc(100vh - 116px)",
            overflow: "auto",
            p: 2.75,
            border: theme.palette.mode === "dark" ? "1px solid rgba(148, 163, 184, 0.16)" : "1px solid #e7ecf4",
            borderRadius: "18px",
            backgroundColor: theme.palette.background.paper,
            boxShadow: notificationsOpen ? "0 20px 50px rgba(15, 23, 42, 0.18)" : "0 4px 14px rgba(15, 23, 42, 0.08)",
            zIndex: 40,
            willChange: "transform, opacity",
            transition: "opacity 180ms ease, transform 180ms ease, box-shadow 180ms ease",
            opacity: notificationsOpen ? 1 : 0,
            transform: notificationsOpen ? "translateY(0) translateX(0) scale(1)" : "translateY(-14px) translateX(18px) scale(0.96)",
            pointerEvents: notificationsOpen ? "auto" : "none",
            animation: notificationsOpen ? "notificationPop 240ms cubic-bezier(0.16, 1, 0.3, 1)" : "none",
          }}
        >
          <Box sx={{ display: "flex", gap: "14px", alignItems: "center", mb: "18px" }}>
            <Box>
              <Typography component="h3" sx={{ m: 0, fontSize: "1.18rem" }}>
                Notifications
              </Typography>
              <Typography sx={{ mt: "6px", color: theme.palette.text.secondary, fontSize: "0.92rem" }}>
                Who liked or commented on your posts
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "grid", gap: "12px", mt: "18px" }}>
            {loadingNotifications && (
              <Box sx={{ p: "16px", borderRadius: "14px", backgroundColor: theme.palette.background.default, color: theme.palette.text.secondary, fontWeight: 700 }}>
                Loading notifications...
              </Box>
            )}

            {!loadingNotifications && notifications.length === 0 && (
              <Box sx={{ p: "16px", borderRadius: "14px", backgroundColor: theme.palette.background.default, color: theme.palette.text.secondary, fontWeight: 700 }}>
                No notifications yet.
              </Box>
            )}

            {notifications.map((notification) => {
              const isLike = notification.type === "like";
              const actorName = notification.actorId?.username || "Someone";
              const postText = notification.postId?.text || "your post";
              const createdAtLabel = formatNotificationDate(notification.createdAt);

              return (
                <Box
                  key={notification._id}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "30px minmax(0, 1fr)",
                    gap: "12px",
                    alignItems: "start",
                    p: "14px",
                    borderRadius: "14px",
                    backgroundColor: theme.palette.background.default,
                  }}
                >
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: "50%",
                      color: "#ffffff",
                      background: isLike ? "linear-gradient(135deg, #2563eb, #60a5fa)" : "linear-gradient(135deg, #0f172a, #475569)",
                    }}
                  >
                    {isLike ? <Heart size={14} fill="currentColor" /> : <MessageSquare size={14} />}
                  </Box>
                  <Box sx={{ display: "grid", gap: "4px" }}>
                    <Typography component="strong" sx={{ color: theme.palette.text.primary }}>
                      {actorName}
                    </Typography>
                    <Typography sx={{ color: theme.palette.text.secondary, lineHeight: 1.45 }}>
                      {isLike ? "liked" : "commented on"} {postText}
                    </Typography>
                    {createdAtLabel && (
                      <Typography component="time" dateTime={notification.createdAt} sx={{ color: theme.palette.text.secondary, fontSize: "0.78rem", fontWeight: 700 }}>
                        {createdAtLabel}
                      </Typography>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default FeedPage;
