"use client"

import { Row } from "@tanstack/react-table"
import { usePathname } from "next/navigation"
import { UserActions } from "./actions/user_actions"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {

  const pathname = usePathname()
  switch(pathname) {
    case '/users':
        return (
          <UserActions row={row}/>
        )
    default :
      return (
        <div></div>
      )
  }
}