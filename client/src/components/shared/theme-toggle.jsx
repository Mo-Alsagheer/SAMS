import { useEffect, useState } from "react"

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light"
  })

  useEffect(() => {
    const root = document.documentElement

    if (theme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }

    localStorage.setItem("theme", theme)
  }, [theme])

  return (
    <button
      type="button"
      onClick={() =>
        setTheme(theme === "dark" ? "light" : "dark")
      }
      className="bg-primary text-primary-foreground md:px-4 md:py-2 rounded-md transition"
    >
      {theme === "dark" ? "Light Mode " : "Dark Mode "}
    </button>
  )
}