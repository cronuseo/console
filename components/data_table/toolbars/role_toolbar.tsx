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
import { useRouter } from "next/navigation"
import { loadavg } from "os"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { cn } from "@/lib/utils"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

const addRoles = async (identifier: string, display_name: string, users: string[], groups: string[], session: any) => {

  const body = {
    identifier: identifier,
    display_name: display_name,
    users: users,
    groups: groups
  };

  const response = await fetch(
    `http://localhost:8080/api/v1/o/${session!.user.organization_id}/roles`,
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
      throw new Error(`Role already exists`);
    }
    throw new Error('Error while adding role');
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

const fetchResources = async (session: any) => {

  const response = await fetch(`http://localhost:8080/api/v1/o/${session.user.organization_id}/resources`, {
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

export function RoleTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const { data: session } = useSession()
  const isFiltered = table.getState().columnFilters.length > 0
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Search"
          value={(table.getColumn("display_name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("display_name")?.setFilterValue(event.target.value)
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
        <Sheet>
          <SheetTrigger asChild>
            <Button size="sm" className="relative" variant="outline">
              Add Role
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Add Role</SheetTitle>
              <SheetDescription>
                Follow the steps to add a new role.
              </SheetDescription>
            </SheetHeader>
            <AddRoleForm session={session} />
          </SheetContent>
        </Sheet>
      </div>
    </div>
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

export function AddRoleForm({ session }: any) {

  const router = useRouter()
  const [users, setUsers] = useState([])
  const [groups, setGroups] = useState([])
  const [resources, setResources] = useState([])
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
        console.error('Failed to fetch group:', error);
        // Handle the error as required
      }
    };
    const loadActions = async () => {
      try {
        const fetchedResources = await fetchResources(session);
        setResources(fetchedResources);
      } catch (error) {
        console.error('Failed to fetch resources:', error);
        // Handle the error as required
      }
    };

    if (session) {
      loadUsers();
      loadGroups();
      loadActions();
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
      identifier: "",
      display_name: ""
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await addRoles(values.identifier, values.display_name, selectedUsers.map((user) => user.value), selectedGroups.map((group) => group.value), session)
      toast({
        title: "Role Added Successfully",
        description: 'The role has been added successfully.',
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Role Addition Failed",
        description: error instanceof Error ? error.message : 'Error while adding the role',
      })
    }

  }

  const [open, setOpen] = React.useState(false)
  const [resource, setResource] = React.useState("")
  const [selectedResources, setSelectedResources] = React.useState<string[]>([])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
          </TabsList>
          <TabsContent value="details">
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
              name="display_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input placeholder="display_name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {users.length > 0 ? <FormField
              control={form.control}
              name="roles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Users</FormLabel>
                  <FormControl>
                    <MultiSelect items={users.map((user: any) => ({
                      value: user.id,
                      label: user.identifier
                    }))} onSelect={handleSelectUsers} selectedItems={[]} />
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
                    }))} onSelect={handleSelectGroups} selectedItems={[]} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> : <div></div>}
          </TabsContent>
          <TabsContent value="permissions">

            {resources.length > 0 ?
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                  >
                    {
                      resource
                        ? (resources.find((resourceItem: any) => resourceItem.identifier === resource) as any)?.identifier
                        : "Select resource"
                    }
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search framework..." />
                    <CommandEmpty>No framework found.</CommandEmpty>
                    <CommandGroup>
                      {resources.map((resource: any) => (
                        <CommandItem
                          key={resource.identifier}
                          value={resource.identifier}
                          onSelect={
                            (currentResource) => {
                              setResource(currentResource === resource ? "" : currentResource)
                              if (!selectedResources.includes(currentResource)) {
                                setSelectedResources([...selectedResources, currentResource]);
                              }
                              setOpen(false)
                            }

                          }
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              resource === resource.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {resource.identifier}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              : <div></div>}
            {selectedResources.length > 0 ?
              selectedResources.map((resource) => (
                <FormField
                  control={form.control}
                  name="roles"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{resource}</FormLabel>
                      <FormControl>
                        <MultiSelect items={groups.map((role: any) => ({
                          value: role.id,
                          label: role.identifier
                        }))} onSelect={handleSelectGroups} selectedItems={[]} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )) : <div></div>}
          </TabsContent>
        </Tabs>
        <Button type="submit">Create</Button>
      </form>
    </Form>
  )
}

