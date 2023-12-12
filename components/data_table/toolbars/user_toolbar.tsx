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

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

const addUsers = async (identifier: string, username: string, session: any) => {

  const body = {
    identifier: identifier,
    username: username,
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
            <AddUserForm session={session}/>
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
})

export function AddUserForm( {session}: any) {
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
      await addUsers(values.identifier, values.username, session)
    } catch (error) {
      toast({
        title: "User adding failed",
        description: "Error while adding user",
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
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}

