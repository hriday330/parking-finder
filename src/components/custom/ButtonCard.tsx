import React from "react";
import { Button } from "@/components/ui/button";

type ButtonCardProps = {
  imageSrc: string;
  altText: string;
  labelText: string;
  onClick: () => void;
  className?: string;
  overlayClass?: string;
  labelClass?: string;
};

const ButtonCard: React.FC<ButtonCardProps> = ({
  imageSrc,
  altText,
  labelText,
  onClick,
  className = "w-48 h-48",
  overlayClass = "",
  labelClass = "",
}) => {
  return (
    <Button
      onClick={onClick}
      variant="ghost"
      className={`relative ${className} overflow-hidden rounded-md focus:outline-none p-0`}
    >
      <img
        src={imageSrc}
        alt={altText}
        className="w-full h-full object-cover rounded-md opacity-40"
      />
      
      <div
        className={`absolute flex flex-col items-end justify-center bg-opacity-90 text-black rounded-md p-2 ${overlayClass}`}
      >
        <p className={`text-2xl font-bold ${labelClass}`}>{labelText}</p>
      </div>
    </Button>
  );
};

export default ButtonCard;

