"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

import UserNav from "./user-nav"
import { ModeToggle } from "./mode-toggle"

const MainNav = () => {
  const pathname = usePathname()

  return (
    <div className="flex flex-row justify-between items-center pr-4 py-4 border-b">
      <div className="flex w-64 justify-center">
        <h2 className="text-3xl font-bold tracking-tight">cronuseo</h2>
      </div>
      <div className="flex items-center space-x-4 pr-2">
        <ModeToggle/>
        <UserNav/>
      </div>
    </div>
  )
}

export default MainNav