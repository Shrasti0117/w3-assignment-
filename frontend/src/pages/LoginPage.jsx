import { useState } from "react";
import { useTheme } from "@mui/material/styles";
import { LogIn, Sparkles } from "lucide-react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { apiRequest } from "../api";

function LoginPage({ onLogin, onSwitch }) {
  const theme = useTheme();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });
      onLogin(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        p: 3,
        backgroundColor: theme.palette.background.default,
        background: theme.palette.mode === "dark" 
          ? `radial-gradient(circle at top left, rgba(59, 130, 246, 0.08), transparent 30%), ${theme.palette.background.default}`
          : "radial-gradient(circle at top left, rgba(250, 204, 21, 0.16), transparent 30%), #f5f7fb",
      }}
    >
      <Box
        component="section"
        sx={{
          width: "min(100%, 440px)",
          backgroundColor: theme.palette.background.paper,
          border: theme.palette.mode === "dark" ? "1px solid rgba(148, 163, 184, 0.16)" : "1px solid #e7ecf4",
          borderRadius: "16px",
          boxShadow: "0 18px 45px rgba(15, 23, 42, 0.09)",
          p: 4,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, color: "#2563eb", fontWeight: 800, mb: 3 }}>
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
            <Sparkles size={22} />
          </Box>
          <Typography variant="h6" component="span" sx={{ fontWeight: 800, fontSize: "1.1rem" }}>
            TaskPlanet Social
          </Typography>
        </Box>

        <Typography component="h1" sx={{ fontSize: "2rem", fontWeight: 900, mb: 1, color: theme.palette.text.primary }}>
          Welcome back
        </Typography>
        <Typography sx={{ color: theme.palette.text.secondary, mb: 3 }}>
          Sign in to catch up with the public feed.
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gap: 2.5 }}>
          <TextField
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
            required
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: true, sx: { color: theme.palette.text.secondary } }}
            InputProps={{
              sx: {
                borderRadius: "12px",
                backgroundColor: theme.palette.background.default,
                '& fieldset': { borderColor: theme.palette.mode === "dark" ? "rgba(148, 163, 184, 0.16)" : "#dbe3ee" },
                '&:hover fieldset': { borderColor: theme.palette.mode === "dark" ? "rgba(148, 163, 184, 0.32)" : "#dbe3ee" },
                '&.Mui-focused fieldset': { borderColor: "#3b82f6" },
                minHeight: 48,
                color: theme.palette.text.primary,
              },
            }}
          />

          <TextField
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
            required
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: true, sx: { color: theme.palette.text.secondary } }}
            InputProps={{
              sx: {
                borderRadius: "12px",
                backgroundColor: theme.palette.background.default,
                '& fieldset': { borderColor: theme.palette.mode === "dark" ? "rgba(148, 163, 184, 0.16)" : "#dbe3ee" },
                '&:hover fieldset': { borderColor: theme.palette.mode === "dark" ? "rgba(148, 163, 184, 0.32)" : "#dbe3ee" },
                '&.Mui-focused fieldset': { borderColor: "#3b82f6" },
                minHeight: 48,
                color: theme.palette.text.primary,
              },
            }}
          />

          {error && (
            <Box
              sx={{
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

          <Button
            type="submit"
            disabled={loading}
            variant="contained"
            disableElevation
            startIcon={<LogIn size={18} />}
            sx={{
              minHeight: 50,
              borderRadius: "14px",
              boxShadow: "0 12px 24px rgba(37, 99, 235, 0.26)",
              fontWeight: 800,
              textTransform: "none",
              background: "linear-gradient(135deg, #2563eb, #3b82f6)",
              '&:hover': { background: "#2563eb" },
            }}
          >
            {loading ? "Signing in..." : "Login"}
          </Button>
        </Box>

        <Button
          type="button"
          onClick={onSwitch}
          sx={{
            mt: 2,
            width: "100%",
            color: "#2563eb",
            fontWeight: 800,
            textTransform: "none",
          }}
        >
          New here? Create an account
        </Button>
      </Box>
    </Box>
  );
}

export default LoginPage;
