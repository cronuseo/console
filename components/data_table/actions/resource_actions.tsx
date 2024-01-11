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
import { MultiSelectItem } from "@/components/ui/multi-select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ActionEntity, GroupEntity, Resource, RoleEntity, User } from "@/types"
import { Session } from "next-auth"
import { MultiInput } from "@/components/ui/multi-input"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}


const deleteResource = async (id: string, session: Session) => {

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL_CRONUSEO_MGT_API_BASE!}/api/v1/o/${session.user.organization_id}/resources/${id}`, {
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

const fetchResource = async (id: string, session: Session) : Promise<Resource> => {

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL_CRONUSEO_MGT_API_BASE!}/api/v1/o/${session.user.organization_id}/resources/${id}`, {
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

export function ResourceActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const router = useRouter()
  const [resource, setResource] = useState<Resource>()
  const handleDelete = async () => {
    try {
      await deleteResource((row.original as any).id, session!)
      toast({
        title: "Resource Deleted Successfully",
        description: 'The resource has been deleted successfully.',
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Resource Deletion Failed",
        description: error instanceof Error ? error.message : 'Error while deleting the resource',
      })
    }
  }

  useEffect(() => {
    const loadUser = async () => {
      try {
        const resource = await fetchResource((row.original as any).id, session!)
        setResource(resource);
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
                <SheetTitle>Edit Resource</SheetTitle>
              </SheetHeader>
              <EditResourceForm session={session!} resource={resource!} />
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
                  This action cannot be undone. This will permanently delete the resource.
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
  actions: z.string().array().optional()
})

function identifyActionChanges(givenActions: string[], selectedActions: string[]): [string[], string[]] {
  const addedRoles = selectedActions.filter(action => !givenActions.includes(action));
  const removedRoles = givenActions.filter(action => !selectedActions.includes(action));

  return [addedRoles, removedRoles];
}

const editResource = async (id: string, added_actions: ActionEntity[], removed_actions: string[], session: Session) => {

  const body = {
    added_actions: added_actions,
    removed_actions: removed_actions
  };

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL_CRONUSEO_MGT_API_BASE!}/api/v1/o/${session!.user.organization_id}/resources/${id}`,
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
      throw new Error(`Resource not exists`);
    }
    throw new Error('Error while updating resource');
  }


  const data = await response.json();
  return data;
};

interface EditUserFormProps {
  session:Session;
  resource: Resource
}

export function EditResourceForm({ session, resource }: EditUserFormProps) {

  const router = useRouter()

  const [actions, setActions] = useState<MultiSelectItem[]>(resource.actions?  resource.actions.map((action:ActionEntity) => ({value : action.identifier, label: action.identifier})) :[]);
  const handleSelectActions = (items: MultiSelectItem[]) => {
    setActions(items);
  };

  const { toast } = useToast()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      identifier: resource.identifier,
      display_name: resource.display_name
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const [addedActions, removedActions] = identifyActionChanges(resource.actions ? resource.actions.map((action: ActionEntity) => action.identifier) : [], actions.map((action) => action.value));
      const removedActionIdentifiers = removedActions?.map((action: string) => action) ?? [];
      await editResource(resource.id, addedActions.map((action) => ({identifier: action, display_name: action})), removedActionIdentifiers, session)
      toast({
        title: "Resource Updated Successfully",
        description: 'The resource has been updated successfully.',
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Resource Update Failed",
        description: error instanceof Error ? error.message : 'Error while updating the resource',
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
    <FormField
          control={form.control}
          name="actions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Actions</FormLabel>
              <FormControl>
                <MultiInput onSelect={handleSelectActions} selectedItems={actions}/>
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