"use client"

import { DataTableColumnHeader } from "@/components/data_table/data-table-column-header"
import { DataTableRowActions } from "@/components/data_table/data-table-row-actions"
import { ColumnDef } from "@tanstack/react-table"

export type User = {
    id: string
    identifier: string
  }

export const user_columns: ColumnDef<User>[] = [
  
  {
    accessorKey: "identifier",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User Identifier" />
    ),
    cell: ({ row }) => {

      return (
        <div className="flex space-x-">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("identifier")}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "username",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Username" />
    ),
    cell: ({ row }) => {

      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("username")}
          </span>
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row}/>,
  },
]