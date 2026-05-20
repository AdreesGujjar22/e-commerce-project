import React, { HTMLAttributes } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "gold" | "teal" | "neutral" | "danger" | "vanguard";
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = "neutral", className = "", ...props }) => {
  const baseStyle =
    "inline-flex items-center text-[9px] tracking-[0.2em] font-display font-medium uppercase px-2.5 py-1 rounded shadow-sm";

  const variants = {
    gold: "bg-gold-150 text-gold-900 border border-gold-300",
    teal: "bg-teal-50 text-teal-800 border border-teal-200",
    neutral: "bg-neutral-100 text-neutral-800 border border-neutral-200",
    danger: "bg-red-50 text-red-800 border border-red-200",
    vanguard: "bg-[#7a5d34] text-gold-100",
  };

  return (
    <span className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};
