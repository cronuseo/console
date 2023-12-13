"use client"

import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import { Row } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AddUserForm } from "../toolbars/user_toolbar"

interface DataTableRowActionsProps<TData> {
    row: Row<TData>
}


const deleteUser = async (id: string, session: any) => {

    const response = await fetch(`http://localhost:8080/api/v1/o/${session.user.organization_id}/users/${id}`, {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${session.id_token}`
        }
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
};

export function UserActions<TData>({
    row,
}: DataTableRowActionsProps<TData>) {
    const { data: session } = useSession()
    const pathname = usePathname()
    const { toast } = useToast()
    const handleDelete = async () => {
        try {
            await deleteUser((row.original as any).id, session)
            toast({
                title: "User Deleted Successfully",
                description: 'The user has been deleted successfully.',
            })
        } catch (error) {
            toast({
                title: "User Deletion Failed",
                description: error instanceof Error ? error.message : 'Error while deleting the user',
            })
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                >
                    <DotsHorizontalIcon className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuItem>
                        <Dialog>
                            <DialogTrigger>
                                <button>Edit</button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add User</DialogTitle>
                                    <DialogDescription>
                                        Follow the steps to add a new user.
                                    </DialogDescription>
                                </DialogHeader>
                                Shashimal
                            </DialogContent>
                        </Dialog>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <button onClick={handleDelete}>Delete</button>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}