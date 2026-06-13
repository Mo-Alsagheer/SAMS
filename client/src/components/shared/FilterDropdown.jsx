import React, { useState } from "react";
import { ListFilterIcon } from "lucide-react";

function FilterDropdown({ options, value, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 border rounded-lg px-4 py-2 bg-card"
      >
        <ListFilterIcon size={16} /><p></p>
        {options.find((option) => option.value === value)?.name ||
          "Filter"}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-card border rounded-lg shadow-lg">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-blue-600 ${
                value === option.value ? "font-semibold text-blue-600" : ""
              }`}
            >
              {option.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default FilterDropdown;
