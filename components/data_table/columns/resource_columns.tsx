"use client"

import { DataTableColumnHeader } from "@/components/data_table/data-table-column-header"
import { DataTableRowActions } from "@/components/data_table/data-table-row-actions"
import { ColumnDef } from "@tanstack/react-table"

export type Resource = {
    id: string
    display_name: string
  }

export const role_columns: ColumnDef<Resource>[] = [
  
  {
    accessorKey: "display_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {

      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("display_name")}
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