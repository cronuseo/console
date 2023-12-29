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
import { usePathname, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AddUserForm } from "../toolbars/user_toolbar"
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { MultiSelectItem, MultiSelect } from "@/components/ui/multi-select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { string, z } from "zod"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}


const deleteRole = async (id: string, session: any) => {

  const response = await fetch(`http://localhost:8080/api/v1/o/${session.user.organization_id}/roles/${id}`, {
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

const getRole = async (id: string, session: any) => {

  const response = await fetch(`http://localhost:8080/api/v1/o/${session.user.organization_id}/roles/${id}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${session.id_token}`
    }
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const data = await response.json();
  return data;
};

const fetchUsers = async (session: any) => {

  const response = await fetch(`http://localhost:8080/api/v1/o/${session.user.organization_id}/users`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${session.id_token}`
    }
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const data = await response.json();
  return data;
};

const fetchGroups = async (session: any) => {

  const response = await fetch(`http://localhost:8080/api/v1/o/${session.user.organization_id}/groups`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${session.id_token}`
    }
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const data = await response.json();
  return data;
};

export function RoleActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const router = useRouter()
  const [role, setRole] = useState(null)
  const handleDelete = async () => {
    try {
      await deleteRole((row.original as any).id, session)
      toast({
        title: "Role Deleted Successfully",
        description: 'The role has been deleted successfully.',
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Role Deletion Failed",
        description: error instanceof Error ? error.message : 'Error while deleting the role',
      })
    }
  }

  useEffect(() => {
    const loadRole = async () => {
      try {
        const role = await getRole((row.original as any).id, session)
        setRole(role);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        // Handle the error as required
      }
    };

    if (session) {
      loadRole();
    }
  }, [session])

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
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <Dialog>
            <DialogTrigger>
              <button>Edit</button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Role</DialogTitle>
                <DialogDescription>
                  Follow the steps to edit the role.
                </DialogDescription>
              </DialogHeader>
              <EditRoleForm session={session} role={role} />
            </DialogContent>
          </Dialog>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button>Delete</button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the role.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction><button onClick={handleDelete}>Continue</button></AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const formSchema = z.object({
  identifier: z.string().min(3, {
    message: "Identifier must be at least 3 characters.",
  }),
  display_name: z.string().min(3, {
    message: "Display name must be at least 3 characters.",
  }),
  roles: z.string().array().optional()
})

function identifyRoleChanges(givenRoles: string[], selectedRoles: string[]): [string[], string[]] {
  const addedRoles = selectedRoles.filter(role => !givenRoles.includes(role));
  const removedRoles = givenRoles.filter(role => !selectedRoles.includes(role));

  return [addedRoles, removedRoles];
}

const editRole = async (id: string, added_users: string[], removed_users: string[], added_groups: string[], removed_groups: string[], session: any) => {

  const body = {
    added_users: added_users,
    removed_users: removed_users,
    added_groups: added_groups,
    removed_groups: removed_groups
  };

  const response = await fetch(
    `http://localhost:8080/api/v1/o/${session!.user.organization_id}/roles/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        API_KEY: process.env.CRONUSEO_API_KEY!,
        Authorization: `Bearer ${session!.id_token}`,
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(`Role not exists`);
    }
    throw new Error('Error while updating role');
  }


  const data = await response.json();
  return data;
};

export function EditRoleForm({ session, role }: any) {

  const router = useRouter()
  const [users, setUsers] = useState([])
  const [groups, setGroups] = useState([])
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const fetchedUsers = await fetchUsers(session);
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        // Handle the error as required
      }
    };
    const loadGroups = async () => {
      try {
        const fetchedGroups = await fetchGroups(session);
        setGroups(fetchedGroups);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        // Handle the error as required
      }
    };

    if (session) {
      loadUsers();
      loadGroups();
    }
  }, [session]);

  const [selectedUsers, setSelectedUsers] = useState<MultiSelectItem[]>([]);

  const handleSelectUsers = (items: MultiSelectItem[]) => {
    setSelectedUsers(items);
  };

  const [selectedGroups, setSelectedGroups] = useState<MultiSelectItem[]>([]);

  const handleSelectGroups = (items: MultiSelectItem[]) => {
    setSelectedGroups(items);
  };

  const { toast } = useToast()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      display_name: role.display_name,
      identifier: role.identifier
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const [addedUsers, removedUsers] = identifyRoleChanges(role.users ? role.users.map((user: any) => user.id) : [], selectedUsers.map((user) => user.value));
      const [addedGroups, removedGroups] = identifyRoleChanges(role.groups ? role.groups.map((group: any) => group.id) : [], selectedGroups.map((group) => group.value));
      await editRole(role.id, addedUsers, removedUsers, addedGroups, removedGroups, session)
      toast({
        title: "Role Updated Successfully",
        description: 'The role has been updated successfully.',
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Role Update Failed",
        description: error instanceof Error ? error.message : 'Error while updating the role',
      })
    }

  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="identifier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Identifier</FormLabel>
              <FormControl>
                <Input placeholder="identifier" {...field} disabled />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="display_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Name</FormLabel>
              <FormControl>
                <Input placeholder="display_name" {...field} disabled />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {role.users && role.users.length > 0 ? <FormField
          control={form.control}
          name="roles"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Users</FormLabel>
              <FormControl>
                <MultiSelect items={users.map((role: any) => ({
                  value: role.id,
                  label: role.identifier
                }))} onSelect={handleSelectUsers} selectedItems={role.users.map((user: any) => ({
                  value: user.id,
                  label: user.identifier
                }))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> : <div></div>}
        {role.groups && role.groups.length > 0 ? <FormField
          control={form.control}
          name="roles"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Groups</FormLabel>
              <FormControl>
                <MultiSelect items={groups.map((role: any) => ({
                  value: role.id,
                  label: role.identifier
                }))} onSelect={handleSelectGroups} selectedItems={role.groups.map((role: any) => ({
                  value: role.id,
                  label: role.identifier
                }))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> : <div></div>}
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}