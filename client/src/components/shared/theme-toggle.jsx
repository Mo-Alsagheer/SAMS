import { useEffect, useState } from "react";

function SunIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    try {
      const stored = localStorage.getItem("theme");
      if (stored) return stored;
      if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      )
        return "dark";
    } catch (e) {}
    return "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    try {
      localStorage.setItem("theme", theme);
    } catch (e) {}
  }, [theme]);

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Activate light theme" : "Activate dark theme"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex items-center gap-3 md:gap-4 focus:outline-none"
    >
      <span className="sr-only">Toggle color theme</span>

      {/* <div className="relative w-14 h-8 p-1 rounded-full transition-colors duration-300 ease-in-out bg-gray-200 dark:bg-gray-700">
        <div
          className={`absolute top-1 left-1 w-6 h-6 bg-white dark:bg-gray-900 rounded-full shadow transform transition-transform duration-300 ease-in-out ${isDark ? "translate-x-6" : "translate-x-0"}`}
        />
      </div> */}

      <div className=" md:flex items-center text-sm text-gray-700 dark:text-gray-200 gap-2">
        {isDark ? (
          <>
            <MoonIcon className="w-4 h-4" />
          </>
        ) : (
          <>
            <SunIcon className="w-4 h-4" />
          </>
        )}
      </div>
    </button>
  );
}
