"use client"

import { Cross2Icon, PlusIcon } from "@radix-ui/react-icons"
import { Table } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from "@/components/ui/label"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSession } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"
import { MultiSelect, MultiSelectItem } from "@/components/ui/multi-select"
import { useEffect, useState } from "react"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

const addUsers = async (identifier: string, username: string, roles: string[], groups: string[], session: any) => {

  const body = {
    identifier: identifier,
    username: username,
    roles: roles,
    groups: groups
  };

  const response = await fetch(
    `http://localhost:8080/api/v1/o/${session!.user.organization_id}/users`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        API_KEY: process.env.CRONUSEO_API_KEY!,
        Authorization: `Bearer ${session!.id_token}`,
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    if (response.status === 409) {
      throw new Error(`User already exists`);
    }
    throw new Error('Error while adding user');
  }


  const data = await response.json();
  return data;
};

const fetchRoles = async (session: any) => {

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

export function UserTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const { data: session } = useSession()
  const isFiltered = table.getState().columnFilters.length > 0
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Search"
          value={(table.getColumn("username")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("username")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className=''>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="relative" variant="outline">
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add User</DialogTitle>
              <DialogDescription>
                Follow the steps to add a new user.
              </DialogDescription>
            </DialogHeader>
            <AddUserForm session={session} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
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

export function AddUserForm({ session }: any) {

  const [roles, setRoles] = useState([])
  const [groups, setGroups] = useState([])
  useEffect(() => {
    const loadRoles = async () => {
      try {
        const fetchedRoles = await fetchRoles(session);
        setRoles(fetchedRoles);
      } catch (error) {
        console.error('Failed to fetch roles:', error);
        // Handle the error as required
      }
    };
    const loadGroups = async () => {
      try {
        const fetchedGroups = await fetchGroups(session);
        setGroups(fetchedGroups);
      } catch (error) {
        console.error('Failed to fetch roles:', error);
        // Handle the error as required
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
      username: "",
      identifier: ""
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await addUsers(values.identifier, values.username, selectedRoles.map((role) => role.value ), selectedGroups.map((group) => group.value ), session)
      toast({
        title: "User Added Successfully",
        description: 'The user has been added successfully.',
      })
    } catch (error) {
      toast({
        title: "User Addition Failed",
        description: error instanceof Error ? error.message : 'Error while adding the user',
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
                <Input placeholder="identifier" {...field} />
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
                <Input placeholder="username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {roles.length > 0 ? <FormField
          control={form.control}
          name="roles"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Roles</FormLabel>
              <FormControl>
                <MultiSelect items={roles.map((role: any) => ({
                  value: role.id,
                  label: role.identifier
                }))} onSelect={handleSelectRoles} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> : <div></div>}
        {groups.length > 0 ? <FormField
          control={form.control}
          name="roles"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Groups</FormLabel>
              <FormControl>
                <MultiSelect items={groups.map((role: any) => ({
                  value: role.id,
                  label: role.identifier
                }))} onSelect={handleSelectGroups} />
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

