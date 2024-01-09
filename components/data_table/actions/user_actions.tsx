"use client"

import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import { Row } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { MultiSelectItem, MultiSelect } from "@/components/ui/multi-select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { GroupEntity, RoleEntity, User } from "@/types"
import { Session } from "next-auth"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}


const deleteUser = async (id: string, session: Session) => {

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

const fetchUser = async (id: string, session: Session) : Promise<User> => {

  const response = await fetch(`http://localhost:8080/api/v1/o/${session.user.organization_id}/users/${id}`, {
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

const fetchRoles = async (session: Session) : Promise<RoleEntity[]> => {

  const response = await fetch(`http://localhost:8080/api/v1/o/${session.user.organization_id}/roles`, {
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

const fetchGroups = async (session: Session) : Promise<GroupEntity[]> => {

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

export function UserActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const router = useRouter()
  const [user, setUser] = useState<User>()
  const handleDelete = async () => {
    try {
      await deleteUser((row.original as any).id, session!)
      toast({
        title: "User Deleted Successfully",
        description: 'The user has been deleted successfully.',
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "User Deletion Failed",
        description: error instanceof Error ? error.message : 'Error while deleting the user',
      })
    }
  }

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await fetchUser((row.original as any).id, session!)
        setUser(user);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };

    if (session) {
      loadUser();
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
          <Sheet>
            <SheetTrigger>
              <button>Edit</button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Edit User</SheetTitle>
              </SheetHeader>
              <EditUserForm session={session!} user={user!} />
            </SheetContent>
          </Sheet>
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
                  This action cannot be undone. This will permanently delete the user.
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
  identifier: z.string().min(6, {
    message: "Identifier must be at least 6 characters.",
  }),
  username: z.string().min(6, {
    message: "Username must be at least 6 characters.",
  }),
  roles: z.string().array().optional()
})

function identifyRoleChanges(givenRoles: string[], selectedRoles: string[]): [string[], string[]] {
  const addedRoles = selectedRoles.filter(role => !givenRoles.includes(role));
  const removedRoles = givenRoles.filter(role => !selectedRoles.includes(role));

  return [addedRoles, removedRoles];
}

const editUser = async (id: string, added_roles: string[], removed_roles: string[], added_groups: string[], removed_groups: string[], session: Session) => {

  const body = {
    added_roles: added_roles,
    removed_roles: removed_roles,
    added_groups: added_groups,
    removed_groups: removed_groups
  };

  const response = await fetch(
    `http://localhost:8080/api/v1/o/${session!.user.organization_id}/users/${id}`,
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
      throw new Error(`User not exists`);
    }
    throw new Error('Error while updating user');
  }


  const data = await response.json();
  return data;
};

interface EditUserFormProps {
  session:Session;
  user: User
}

export function EditUserForm({ session, user }: EditUserFormProps) {

  const router = useRouter()
  const [roles, setRoles] = useState<RoleEntity[]>([])
  const [groups, setGroups] = useState<GroupEntity[]>([])
  useEffect(() => {
    const loadRoles = async () => {
      try {
        const fetchedRoles = await fetchRoles(session);
        setRoles(fetchedRoles);
      } catch (error) {
        console.error('Failed to fetch roles:', error);
      }
    };
    const loadGroups = async () => {
      try {
        const fetchedGroups = await fetchGroups(session);
        setGroups(fetchedGroups);
      } catch (error) {
        console.error('Failed to fetch roles:', error);
      }
    };

    if (session) {
      loadRoles();
      loadGroups();
    }
  }, [session]);

  const [selectedRoles, setSelectedRoles] = useState<MultiSelectItem[]>([]);

  const handleSelectRoles = (items: MultiSelectItem[]) => {
    setSelectedRoles(items);
  };

  const [selectedGroups, setSelectedGroups] = useState<MultiSelectItem[]>([]);

  const handleSelectGroups = (items: MultiSelectItem[]) => {
    setSelectedGroups(items);
  };

  const { toast } = useToast()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: user.username,
      identifier: user.identifier
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const [addedRoles, removedRoles] = identifyRoleChanges(user.roles ? user.roles.map((role: RoleEntity) => role.id) : [], selectedRoles.map((role) => role.value));
      const [addedGroups, removedGroups] = identifyRoleChanges(user.groups ? user.groups.map((group: GroupEntity) => group.id) : [], selectedGroups.map((group) => group.value));
      await editUser(user.id, addedRoles, removedRoles, addedGroups, removedGroups, session)
      toast({
        title: "User Updated Successfully",
        description: 'The user has been updated successfully.',
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "User Update Failed",
        description: error instanceof Error ? error.message : 'Error while updating the user',
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
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="username" {...field} disabled />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {user.roles && user.roles.length > 0 ? <FormField
          control={form.control}
          name="roles"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Roles</FormLabel>
              <FormControl>
                <MultiSelect items={roles.map((role: any) => ({
                  value: role.id,
                  label: role.identifier
                }))} onSelect={handleSelectRoles} selectedItems={user.roles!.map((role: any) => ({
                  value: role.id,
                  label: role.identifier
                }))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> : <div></div>}
        {user.groups && user.groups.length > 0 ? <FormField
          control={form.control}
          name="roles"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Groups</FormLabel>
              <FormControl>
                <MultiSelect items={groups.map((group: GroupEntity) => ({
                  value: group.id,
                  label: group.identifier
                }))} onSelect={handleSelectGroups} selectedItems={user.groups!.map((group: GroupEntity) => ({
                  value: group.id,
                  label: group.identifier
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