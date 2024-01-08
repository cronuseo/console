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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ActionEntity } from "@/types"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

const addResource = async (identifier: string, display_name: string, actions: ActionEntity[], session: any) => {

  const body = {
    identifier: identifier,
    display_name: display_name,
    actions: actions
  };

  const response = await fetch(
    `http://localhost:8080/api/v1/o/${session!.user.organization_id}/resources`,
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
      throw new Error(`Resource already exists`);
    }
    throw new Error('Error while adding resource');
  }


  const data = await response.json();
  return data;
};

export function ResourceTableToolbar<TData>({
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
        <Sheet>
          <SheetTrigger asChild>
            <Button size="sm" className="relative" variant="outline">
              Create Resource
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>New Resource</SheetTitle>
            </SheetHeader>
            <AddResourceForm session={session} />
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
  actions: z.string().array().optional()
})

export function AddResourceForm({ session }: any) {

  const router = useRouter()


  const [actions, setActions] = useState<MultiSelectItem[]>([]);


  const [selectedGroups, setSelectedGroups] = useState<MultiSelectItem[]>([]);

  const handleSelectGroups = (items: MultiSelectItem[]) => {
    setSelectedGroups(items);
  };

  const { toast } = useToast()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        display_name: "",
      identifier: ""
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
    //   await addUsers(values.identifier, values.username, selectedRoles.map((role) => role.value ), selectedGroups.map((group) => group.value ), session)
      toast({
        title: "User Added Successfully",
        description: 'The user has been added successfully.',
      })
      router.refresh()
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
          name="display_name"
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
        <Button type="submit">Create</Button>
      </form>
    </Form>
  )
}

