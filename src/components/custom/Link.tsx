import React from "react";
import { cn } from "@/lib/utils"; 

type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: "default" | "underline" | "button"; 
}

const Link: React.FC<LinkProps> = ({
  children,
  variant = "default",
  className,
  ...props
}) => {
  const baseStyles = "text-blue-500 hover:text-blue-700 focus:outline-none";
  const variants = {
    default: baseStyles,
    underline: `${baseStyles} underline`,
    button: "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 hover:text-white",
  };

  return (
    <a {...props} className={cn(variants[variant], className)}>
      {children}
    </a>
  );
};

export default Link;
