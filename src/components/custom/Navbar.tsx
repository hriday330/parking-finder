import React from 'react'
import { cn } from '@/lib/utils'

interface NavbarProps {
  children: React.ReactNode
  className?: string
}

const Navbar: React.FC<NavbarProps> = ({ children, className }) => {
  return (
    <nav
      className={cn(
        "fixed top-0 left-0 w-full bg-[#FCECAB] shadow-md p-4 flex justify-between items-center z-50",
        className
      )}
    >
      <div className="text-lg font-bold">Brand</div>
      <div className="flex space-x-4">{children}</div>
    </nav>
  )
}

export default Navbar
