"use client"

import * as React from "react"

import UserNav from "./user-nav"
import { ModeToggle } from "./mode-toggle"
import Logo from "./logo"

const MainNav = () => {

  return (
    <div className="flex flex-row justify-between items-center pr-4 py-4 border-b">
      <div className="flex w-64 justify-center">
        <Logo width={200} height={30} fill="#facc15"/>
      </div>
      <div className="flex items-center space-x-4 pr-2">
        <ModeToggle />
        <UserNav />
      </div>
    </div>
  )
}

export default MainNav