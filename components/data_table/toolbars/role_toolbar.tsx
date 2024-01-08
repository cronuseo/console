"use client"

import { Cross2Icon } from "@radix-ui/react-icons"
import { Table } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSession } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"
import { MultiSelect, MultiSelectItem } from "@/components/ui/multi-select"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { Session } from "next-auth"
import { ActionEntity, GroupEntity, PermissionEntity, ResourceEntity, UserEntity } from "@/types"
import ActionSelector from "@/components/action-selector"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

const addRoles = async (identifier: string, display_name: string, users: string[], groups: string[], permissions: PermissionEntity[], session: Session) => {

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

const fetchUsers = async (session: Session): Promise<UserEntity[]> => {

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

const fetchGroups = async (session: Session): Promise<GroupEntity[]> => {

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

const fetchResources = async (session: Session): Promise<ResourceEntity[]> => {

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
      <Sheet>
        <SheetTrigger asChild>
          <Button size="sm" className="relative" variant="outline">
            Create Role
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[400px] sm:w-[450px] sm:max-w-none">
          <div className="h-screen">
            <SheetHeader>
              <SheetTitle>New Role</SheetTitle>
            </SheetHeader>
            <AddRoleForm session={session} />
          </div>
        </SheetContent>
      </Sheet>
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
  const [users, setUsers] = useState<UserEntity[]>([])
  const [groups, setGroups] = useState<GroupEntity[]>([])
  const [resources, setResources] = useState<ResourceEntity[]>([])
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const fetchedUsers = await fetchUsers(session);
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };
    const loadGroups = async () => {
      try {
        const fetchedGroups = await fetchGroups(session);
        setGroups(fetchedGroups);
      } catch (error) {
        console.error('Failed to fetch group:', error);
      }
    };
    const loadResources = async () => {
      try {
        const fetchedResources = await fetchResources(session);
        setResources(fetchedResources);
      } catch (error) {
        console.error('Failed to fetch resources:', error);
      }
    };

    if (session) {
      loadUsers();
      loadGroups();
      loadResources();
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
      let permissions: PermissionEntity[] = [];
      resources.forEach(resource => {
        const actionEntities = selectedResourceActions.get(resource.id);
        actionEntities?.forEach(action => {
          permissions.push({ resource: resource.identifier, action: action.identifier });
        });
      });
      await addRoles(values.identifier, values.display_name, selectedUsers.map((user) => user.value), selectedGroups.map((group) => group.value), permissions, session)
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
  const [selectedResource, setSelectedResource] = React.useState<ResourceEntity>()
  const [selectedResources, setSelectedResources] = React.useState<ResourceEntity[]>([])
  const [selectedResourceActions, setSelectedResourceActions] = React.useState<Map<string, ActionEntity[]>>(new Map<string, ActionEntity[]>)
  return (
    <div className="h-full pb-20 mt-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="h-full">
          <div className="flex flex-col w-full justify-between h-full">
            <div className="flex">
              <Tabs defaultValue="details">
                <TabsList className="grid grid-cols-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="users">Users</TabsTrigger>
                  <TabsTrigger value="groups">Groups</TabsTrigger>
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
                </TabsContent>
                <TabsContent value="users">
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
                </TabsContent>
                <TabsContent value="groups">
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
                            selectedResource
                              ? (resources.find((resourceItem: ResourceEntity) => resourceItem.identifier === selectedResource.identifier))?.identifier
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
                            {resources.map((resource: ResourceEntity) => (
                              <CommandItem
                                key={resource.identifier}
                                value={resource.identifier}
                                onSelect={
                                  (currentResource) => {
                                    if (!selectedResource || currentResource !== selectedResource.identifier) {
                                      const r = resources.find(r => r.identifier === currentResource);
                                      setSelectedResource(r);
                                    }
                                    setSelectedResources(prevSelectedResources => {
                                      if (prevSelectedResources.some(r => r.identifier === currentResource)) {
                                        return prevSelectedResources;
                                      } else {
                                        const newResource = resources.find(r => r.identifier === currentResource);
                                        return newResource ? [...prevSelectedResources, newResource] : prevSelectedResources;
                                      }
                                    });
                                    setOpen(false);

                                  }

                                }
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedResource?.identifier === resource.identifier ? "opacity-100" : "opacity-0"
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
                    selectedResources.map((resource: ResourceEntity) => (
                      <FormField
                        control={form.control}
                        name="roles"
                        key={resource.identifier}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{resource.identifier}</FormLabel>
                            <FormControl>
                              <ActionSelector resourceId={resource.id} selectedResourceActions={selectedResourceActions} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )) : <div></div>}
                </TabsContent>
              </Tabs>
            </div>
            <div className="flex justify-end">
              <Button type="submit" size="sm">Create</Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}

