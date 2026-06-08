import React from "react";
import { Search, X } from "lucide-react";

function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}) {
  return (
    <div className={`relative w-full ${className}`}>
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        size={18}
        aria-hidden="true"
      />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full border rounded-lg pl-10 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow shadow-sm"
      />

      {value ? (
        <button
          type="button"
          onClick={() => onChange?.("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      ) : null}
    </div>
  );
}

export default SearchBar;
