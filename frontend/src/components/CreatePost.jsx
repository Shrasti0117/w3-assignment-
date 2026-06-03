import { useRef, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { Image, Send, X } from "lucide-react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { apiRequest } from "../api";

function CreatePost({ onCreated }) {
  const theme = useTheme();
  const [text, setText] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  function handleImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setImage(reader.result);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!text.trim() && !image) {
      setError("Write something or attach an image before posting.");
      return;
    }

    setLoading(true);
    try {
      const post = await apiRequest("/posts", {
        method: "POST",
        body: JSON.stringify({ text, image }),
      });
      onCreated(post);
      setText("");
      setImage("");
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card
      component="section"
      sx={{
        mt: "30px",
        overflow: "hidden",
        backgroundColor: theme.palette.background.paper,
        border: theme.palette.mode === "dark" ? "1px solid rgba(148, 163, 184, 0.16)" : "1px solid #e7ecf4",
        borderRadius: "16px",
        boxShadow: "0 4px 14px rgba(15, 23, 42, 0.08)",
      }}
    >
      <Box component="form" onSubmit={handleSubmit} sx={{ p: "28px 30px 0" }}>
        <Typography component="h2" sx={{ m: 0, mb: "18px", fontSize: "1.4rem", fontWeight: 700 }}>
          Create Post
        </Typography>

        <TextField
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your mind?"
          multiline
          minRows={4}
          fullWidth
          variant="outlined"
          InputProps={{
            sx: {
              borderRadius: "14px",
              backgroundColor: theme.palette.background.default,
              '& fieldset': {
                borderColor: theme.palette.mode === "dark" ? "rgba(148, 163, 184, 0.16)" : "#dbe3ee",
              },
              '&:hover fieldset': {
                borderColor: theme.palette.mode === "dark" ? "rgba(148, 163, 184, 0.32)" : "#dbe3ee",
              },
              '&.Mui-focused fieldset': {
                borderColor: "#3b82f6",
              },
              fontSize: "1.05rem",
              minHeight: "122px",
              p: 0,
            },
          }}
          inputProps={{
            style: {
              padding: "18px",
            },
          }}
          sx={{
            textarea: {
              resize: "vertical",
            },
          }}
        />

        {image && (
          <Box sx={{ position: "relative", mt: "16px" }}>
            <Box
              component="img"
              src={image}
              alt="Selected upload preview"
              sx={{
                width: "100%",
                maxHeight: 360,
                objectFit: "cover",
                borderRadius: "14px",
              }}
            />
            <Button
              type="button"
              onClick={() => setImage("")}
              aria-label="Remove image"
              sx={{
                position: "absolute",
                top: 12,
                right: 12,
                width: 36,
                height: 36,
                minWidth: 36,
                minHeight: 36,
                borderRadius: "50%",
                color: "#ffffff",
                background: "rgba(15, 23, 42, 0.78)",
                p: 0,
                '&:hover': {
                  background: "rgba(15, 23, 42, 0.88)",
                },
              }}
            >
              <X size={18} />
            </Button>
          </Box>
        )}

        {error && (
          <Box
            sx={{
              mt: "18px",
              border: "1px solid #fecaca",
              borderRadius: "12px",
              p: "12px 14px",
              color: "#991b1b",
              backgroundColor: "#fff1f2",
              fontWeight: 700,
            }}
          >
            {error}
          </Box>
        )}

        <Box
          sx={{
            minHeight: "92px",
            mt: "22px",
            px: "30px",
            py: "18px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            borderTop: "1px solid #edf1f7",
          }}
        >
          <Button
            type="button"
            onClick={() => fileRef.current?.click()}
            sx={{
              width: 50,
              height: 50,
              minWidth: 50,
              minHeight: 50,
              color: "#475569",
              backgroundColor: "#f1f5f9",
              borderRadius: "16px",
              p: 0,
              '&:hover': {
                backgroundColor: "#e2e8f0",
              },
            }}
          >
            <Image size={21} />
          </Button>
          <Box component="input" ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} hidden />
          <Button
            type="submit"
            disabled={loading}
            variant="contained"
            disableElevation
            sx={{
              ml: "auto",
              minWidth: 114,
              minHeight: 50,
              borderRadius: "14px",
              background: "linear-gradient(135deg, #2563eb, #3b82f6)",
              color: "#ffffff",
              fontWeight: 900,
              '&:hover': {
                background: "#2563eb",
              },
            }}
          >
            <Send size={18} />
            <Box component="span" sx={{ ml: "10px" }}>
              {loading ? "Posting..." : "Post"}
            </Box>
          </Button>
        </Box>
      </Box>
    </Card>
  );
}

export default CreatePost;
