import React from 'react'

function TabButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-3 text-sm font-medium transition ${
        active
          ? "border-b-2 border-primary text-primary"
          : "text-muted-foreground hover:text-primary"
      }`}
    >
      {label}
    </button>
  );
}

export default TabButton