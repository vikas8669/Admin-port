import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/theme-provider";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className="flex items-center justify-center rounded-full p-2
                 transition-all duration-500
                 hover:bg-neutral-200
                 dark:hover:bg-neutral-800"
    >
      <span
        className={`transition-transform duration-500 ${
          isDark ? "rotate-180 scale-110" : "rotate-0 scale-100"
        }`}
      >
        {isDark ? (
          <Sun className="h-5 w-5 text-yellow-400" />
        ) : (
          <Moon className="h-5 w-5 text-blue-500" />
        )}
      </span>
    </button>
  );
}
