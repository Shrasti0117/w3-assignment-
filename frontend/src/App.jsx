import { useEffect, useMemo, useState } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { clearAuth, getStoredAuth, saveAuth } from "./api";
import FeedPage from "./pages/FeedPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

function App() {
  const [auth, setAuth] = useState({ token: null, user: null });
  const [view, setView] = useState("login");
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("tp_theme");
    if (saved === "light" || saved === "dark") {
      return saved;
    }
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  });

  useEffect(() => {
    const stored = getStoredAuth();
    setAuth(stored);
    if (stored.token) setView("feed");
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("tp_theme", theme);
  }, [theme]);

  const themeConfig = useMemo(
    () =>
      createTheme({
        palette: {
          mode: theme,
          background: {
            default: theme === "dark" ? "#050816" : "#f8fafc",
            paper: theme === "dark" ? "#0f172a" : "#ffffff",
          },
          text: {
            primary: theme === "dark" ? "#f8fafc" : "#0f172a",
            secondary: theme === "dark" ? "#94a3b8" : "#64748b",
          },
        },
        typography: {
          fontFamily: "Inter, sans-serif",
        },
      }),
    [theme]
  );

  function toggleTheme() {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  }

  function handleAuthSuccess(payload) {
    saveAuth(payload);
    setAuth(payload);
    setView("feed");
  }

  function handleLogout() {
    clearAuth();
    setAuth({ token: null, user: null });
    setView("login");
  }

  if (!auth.token && view === "signup") {
    return (
      <ThemeProvider theme={themeConfig}>
        <CssBaseline />
        <SignupPage onSignup={handleAuthSuccess} onSwitch={() => setView("login")} />
      </ThemeProvider>
    );
  }

  if (!auth.token) {
    return (
      <ThemeProvider theme={themeConfig}>
        <CssBaseline />
        <LoginPage onLogin={handleAuthSuccess} onSwitch={() => setView("signup")} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={themeConfig}>
      <CssBaseline />
      <FeedPage
        user={auth.user}
        themeMode={theme}
        onLogout={handleLogout}
        onToggleTheme={toggleTheme}
      />
    </ThemeProvider>
  );
}

export default App;
