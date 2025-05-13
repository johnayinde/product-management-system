"use client";

import React, { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, fullWidth = true, className = "", ...props }, ref) => {
    return (
      <div className={`mb-4 ${fullWidth ? "w-full" : ""}`}>
        {label && (
          <label
            htmlFor={props.id || props.name}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`px-3 py-2 bg-white border shadow-sm border-gray-300 placeholder-gray-400 
                     focus:outline-none focus:border-blue-500 focus:ring-blue-500 block rounded-md sm:text-sm 
                     focus:ring-1 resize-none ${
                       error ? "border-red-500" : ""
                     } ${fullWidth ? "w-full" : ""} ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;
