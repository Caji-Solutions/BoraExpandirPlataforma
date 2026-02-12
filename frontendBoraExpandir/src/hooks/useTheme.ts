import { useEffect, useState, useCallback } from "react";

export type Theme = "light" | "dark";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }, []);

  const toggleTheme = useCallback(() => {
    // Disable toggling, always light
    setTheme("light");
  }, []);

  return { theme, setTheme, toggleTheme };
}
