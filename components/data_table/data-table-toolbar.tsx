"use client"

import { Cross2Icon, PlusIcon } from "@radix-ui/react-icons"
import { Table } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { usePathname } from "next/navigation"
import { UserTableToolbar } from "./toolbars/user_toolbar"
import { RoleTableToolbar } from "./toolbars/role_toolbar"
import { ResourceTableToolbar } from "./toolbars/resource_toolbar"


interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table
}: DataTableToolbarProps<TData>) {

  const pathname = usePathname()
  switch (pathname) {
    case '/users':
      return (
        <UserTableToolbar table={table} />
      )
    case '/roles':
      return (
        <RoleTableToolbar table={table} />
      )
    case '/resources':
      return (
        <ResourceTableToolbar table={table} />
      )
    default:
      return (
        <div></div>
      )
  }

}