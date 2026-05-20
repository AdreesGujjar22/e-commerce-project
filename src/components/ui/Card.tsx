import React, { HTMLAttributes } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, hoverEffect = true, className = "", ...props }) => {
  return (
    <div
      className={`bg-white/80 backdrop-blur-subtle border border-gold-150 rounded-2xl p-6 transition-all duration-300 ${
        hoverEffect ? "hover:shadow-card hover:-translate-y-1 hover:border-gold-300" : "shadow-sm"
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
