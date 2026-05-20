import React, { InputHTMLAttributes, forwardRef } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  idAttr?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, idAttr, ...props }, ref) => {
    return (
      <div className="w-full text-left">
        {label && (
          <label className="block text-[10px] font-display font-semibold uppercase tracking-wider text-neutral-500 mb-1.5Selector">
            {label}
          </label>
        )}
        <input
          id={idAttr}
          ref={ref}
          className={`w-full bg-[#faf9f6]/95 text-neutral-950 placeholder-neutral-400 font-sans text-xs px-4 py-3.5 border border-gold-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-gold-400/90 transition-all ${
            error ? "border-red-500 focus:ring-red-450" : "border-gold-200"
          } ${className}`}
          {...props}
        />
        {error && <span className="block mt-1 text-[10px] text-red-500 font-sans">{error}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";
