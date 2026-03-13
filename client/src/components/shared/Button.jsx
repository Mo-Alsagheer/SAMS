import React from "react";

const Button = ({ children, className = "", ...props }) => {
  const baseStyles =
    "px-6 py-3 md:px-8 md:py-4 rounded-xl font-bold text-base md:text-xl transition-all duration-500 active:scale-95 shadow-md md:shadow-lg hover:-translate-y-1 md:hover:-translate-y-2 flex items-center justify-center gap-2 outline-none focus:ring-2 focus:ring-cyan-400/50";

  return (
    <button className={`${baseStyles} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
